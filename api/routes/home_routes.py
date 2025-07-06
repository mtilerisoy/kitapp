from flask import request, jsonify, g
from api.services import book_service, categories_service
from api.utils.logger_config import logger
from api.utils.authentication import login_required
from uuid import UUID

from api.db.supabase_client import get_supabase_admin_client


def register_home_routes(app):
    logger.debug("Registering home routes")

    @app.route("/api/health", methods=["GET"])
    def index():
        logger.debug("api/health route accessed")
        return jsonify({"message": "API is running", "request_id": g.request_id}), 200

    @app.route("/api/me", methods=["GET"])
    @login_required
    def me():
        # Log user authetnication tokens
        logger.debug("api/me route accessed")

        user_id = g.get("user_id", None)
        user_jwt = g.get("user_jwt", None)
        refresh_token = g.get("refresh_token", None)

        logger.debug(f"User ID: {user_id}")
        logger.debug(f"User JWT: {user_jwt}")
        logger.debug(f"Refresh Token: {refresh_token}")

        if not user_id:
            logger.warning(
                f"User ID not found in request context | Request ID: {g.request_id}"
            )
            return (
                jsonify(
                    {
                        "error": {
                            "type": "AuthenticationError",
                            "message": "User not authenticated",
                            "code": "unauthorized",
                            "request_id": g.request_id,
                        }
                    }
                ),
                401,
            )
        return (
            jsonify(
                {
                    "user_id": user_id,
                    "user_jwt": user_jwt,
                    "refresh_token": refresh_token,
                    "request_id": g.request_id,
                }
            ),
            200,
        )

    @app.route("/api/categories", methods=["GET"])
    def get_categories():
        logger.debug(f"Get categories route accessed | Request ID: {g.request_id}")
        try:
            categories = categories_service.get_categories()
            return jsonify({"categories": categories, "request_id": g.request_id}), 200
        except Exception as e:
            logger.error(
                f"Error fetching categories: {str(e)} | Request ID: {g.request_id}"
            )
            return (
                jsonify(
                    {
                        "error": {
                            "type": "FetchError",
                            "message": "Internal server error fetching categories",
                            "code": "fetch_categories_error",
                            "request_id": g.request_id,
                        }
                    }
                ),
                500,
            )

    @app.route("/api/books", methods=["GET"])
    @login_required  # Protect this route so only logged-in users can see books
    def get_books():
        logger.debug(f"Get books route accessed | Request ID: {g.request_id}")
        try:
            # Get pagination parameters from the query string with defaults
            page = request.args.get("page", 1, type=int)
            limit = request.args.get("limit", 20, type=int)

            books = book_service.get_discover_books(page=page, limit=limit)

            if books is not None:
                return jsonify({"books": books, "request_id": g.request_id}), 200
            else:
                # Differentiate between "no books found" (an empty list) and an actual error
                return jsonify({"books": [], "request_id": g.request_id}), 200

        except Exception as e:
            logger.error(f"Error fetching books: {str(e)} | Request ID: {g.request_id}")
            return (
                jsonify(
                    {
                        "error": {
                            "type": "FetchError",
                            "message": "Internal server error fetching books",
                            "code": "fetch_books_error",
                            "request_id": g.request_id,
                        }
                    }
                ),
                500,
            )

    # --- SYNTH-STACK: NEW ROUTE FOR FETCHING BOOK CONTENT URL ---
    @app.route("/api/books/<uuid:book_id>/read", methods=["GET"])
    @login_required
    def get_book_read_url(book_id: UUID):
        try:
            # SYNTH-STACK: Use the new admin client to bypass RLS for this system task
            supabase_admin = get_supabase_admin_client()

            # 1. Fetch the book record to get its storage path
            book_record_req = (
                supabase_admin.table("books")
                .select("epub_storage_path")
                .eq("id", str(book_id))
                .single()
                .execute()
            )

            # The response object from supabase-py v1 is different, access data attribute
            book_record = book_record_req.data

            if not book_record or not book_record.get("epub_storage_path"):
                logger.warning(
                    f"Book content path not found for book_id: {book_id} | Request ID: {g.request_id}"
                )
                return (
                    jsonify(
                        {
                            "error": {
                                "type": "NotFoundError",
                                "message": "Book content not available.",
                                "code": "book_content_not_found",
                                "request_id": g.request_id,
                            }
                        }
                    ),
                    404,
                )

            storage_path = book_record.get("epub_storage_path")
            # Assuming storage_path is like 'public-epubs/filename.epub'
            # We need to extract the bucket name and the file path within the bucket
            path_parts = storage_path.split("/", 1)
            bucket_name = path_parts[0]
            file_path = path_parts[1] if len(path_parts) > 1 else ""

            # 2. Generate a signed URL valid for 1 hour (3600 seconds)
            signed_url_response = supabase_admin.storage.from_(
                bucket_name
            ).create_signed_url(file_path, 3600)

            # The response is now a dictionary, not an object with attributes
            if (
                "error" in signed_url_response
                and signed_url_response["error"] is not None
            ):
                logger.error(
                    f"Error creating signed URL: {signed_url_response['error']} | Request ID: {g.request_id}"
                )
                return (
                    jsonify(
                        {
                            "error": {
                                "type": "StorageError",
                                "message": "Could not retrieve book content.",
                                "code": "signed_url_error",
                                "request_id": g.request_id,
                            }
                        }
                    ),
                    500,
                )

            signed_url = signed_url_response.get("signedURL")
            return jsonify({"signed_url": signed_url, "request_id": g.request_id}), 200

        except Exception as e:
            logger.error(
                f"Unexpected error in get_book_read_url: {e} | Request ID: {g.request_id}",
                exc_info=True,
            )
            return (
                jsonify(
                    {
                        "error": {
                            "type": "InternalServerError",
                            "message": "Internal server error.",
                            "code": "internal_error",
                            "request_id": g.request_id,
                        }
                    }
                ),
                500,
            )

    @app.route("/api/my-books", methods=["GET", "POST"])
    @login_required
    def my_books():
        user_id = g.user_id  # Guaranteed to exist by @login_required

        if request.method == "POST":
            logger.debug(
                f"POST /api/my-books route accessed | Request ID: {g.request_id}"
            )
            data = request.get_json()
            if not data or "book_id" not in data:
                return (
                    jsonify(
                        {
                            "error": {
                                "type": "ValidationError",
                                "message": "book_id is required.",
                                "code": "missing_book_id",
                                "request_id": g.request_id,
                            }
                        }
                    ),
                    400,
                )

            try:
                book_id = UUID(data["book_id"])
            except (ValueError, TypeError):
                return (
                    jsonify(
                        {
                            "error": {
                                "type": "ValidationError",
                                "message": "Invalid book_id format.",
                                "code": "invalid_book_id_format",
                                "request_id": g.request_id,
                            }
                        }
                    ),
                    400,
                )

            result = book_service.add_book_to_user_library(
                user_id=user_id, book_id=book_id
            )

            if result["success"]:
                return (
                    jsonify({"data": result["data"], "request_id": g.request_id}),
                    result["status_code"],
                )
            else:
                return (
                    jsonify(
                        {
                            "error": {
                                "type": "ServiceError",
                                "message": result["message"],
                                "code": "add_book_error",
                                "request_id": g.request_id,
                            }
                        }
                    ),
                    result["status_code"],
                )

        if request.method == "GET":
            logger.debug(
                f"GET /api/my-books route accessed | Request ID: {g.request_id}"
            )
            try:
                library_data = book_service.get_user_library(user_id)
                if library_data is not None:
                    return (
                        jsonify({"library": library_data, "request_id": g.request_id}),
                        200,
                    )
                else:
                    return (
                        jsonify(
                            {
                                "error": {
                                    "type": "ServiceError",
                                    "message": "Failed to retrieve user library.",
                                    "code": "get_library_error",
                                    "request_id": g.request_id,
                                }
                            }
                        ),
                        500,
                    )
            except Exception as e:
                logger.error(
                    f"Error fetching user library: {e} | Request ID: {g.request_id}"
                )
                return (
                    jsonify(
                        {
                            "error": {
                                "type": "InternalServerError",
                                "message": "Internal server error.",
                                "code": "internal_error",
                                "request_id": g.request_id,
                            }
                        }
                    ),
                    500,
                )

    @app.route("/api/my-books/<uuid:book_id>", methods=["PATCH"])
    @login_required
    def update_my_book(book_id: UUID):
        user_id = g.user_id
        data = request.get_json()

        if not data:
            return (
                jsonify(
                    {
                        "error": {
                            "type": "ValidationError",
                            "message": "Request body cannot be empty.",
                            "code": "empty_body",
                            "request_id": g.request_id,
                        }
                    }
                ),
                400,
            )

        status = data.get("status")
        progress = data.get("progress")

        result = book_service.update_user_book_progress(
            user_id=user_id, book_id=book_id, status=status, progress=progress
        )

        if result["success"]:
            return (
                jsonify({"data": result["data"], "request_id": g.request_id}),
                result["status_code"],
            )
        else:
            return (
                jsonify(
                    {
                        "error": {
                            "type": "ServiceError",
                            "message": result["message"],
                            "code": "update_book_error",
                            "request_id": g.request_id,
                        }
                    }
                ),
                result["status_code"],
            )

    @app.route("/api/books", methods=["POST"])
    def create_book():
        logger.debug(f"Create book route accessed | Request ID: {g.request_id}")

        try:
            data = request.json
            title = data.get("title")

            if not title:
                return (
                    jsonify(
                        {
                            "error": {
                                "type": "ValidationError",
                                "message": "Description is required",
                                "code": "missing_description",
                                "request_id": g.request_id,
                            }
                        }
                    ),
                    400,
                )

            user_id = g.get("user_id", None)
            user_jwt = g.get("user_jwt", None)
            refresh_token = g.get("refresh_token", None)

            book_id = book_service.create_book(
                title_txt=title,
                user_id=user_id,
                user_jwt=user_jwt,
                refresh_token=refresh_token,
            )

            if book_id:
                return jsonify({"jobId": book_id, "request_id": g.request_id}), 202
            else:
                return (
                    jsonify(
                        {
                            "error": {
                                "type": "ServiceError",
                                "message": "Failed to initiate job creation",
                                "code": "create_book_error",
                                "request_id": g.request_id,
                            }
                        }
                    ),
                    500,
                )

        except ValueError as ve:
            logger.warning(
                f"Validation error creating job: {str(ve)} | Request ID: {g.request_id}"
            )
            return (
                jsonify(
                    {
                        "error": {
                            "type": "ValidationError",
                            "message": str(ve),
                            "code": "validation_error",
                            "request_id": g.request_id,
                        }
                    }
                ),
                400,
            )
        except Exception as e:
            logger.error(f"Error creating job: {str(e)} | Request ID: {g.request_id}")
            return (
                jsonify(
                    {
                        "error": {
                            "type": "InternalServerError",
                            "message": "Internal server error creating job",
                            "code": "internal_error",
                            "request_id": g.request_id,
                        }
                    }
                ),
                500,
            )
