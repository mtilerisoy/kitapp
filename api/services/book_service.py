import os
import uuid
import threading
import requests

from typing import Optional, Dict
from dotenv import load_dotenv
from uuid import UUID


from api.db.supabase_client import get_supabase_client
from api.db.repositories.myBooks_repository import MyBooks


from api.utils.logger_config import logger


load_dotenv()


def create_book(
        title_txt: str,
        user_id: Optional[UUID],
        user_jwt: Optional[str],
        refresh_token: Optional[str]) -> Optional[str]:
    """
    Initiates job creation: saves initial data, triggers background processing.
    Returns basic job info for the client.
    """
    supabase_client = get_supabase_client()
    job_desc_repo = MyBooks(supabase_client)

    logger.info(f"Initiating job creation by user {user_id} for job description {title_txt}")
    book_id = uuid.uuid4()

    job_desc_record = job_desc_repo.create(
        book_id=book_id,
        title=title_txt,
        user_id=user_id
    )

    if not job_desc_record:
        logger.error(f"Failed to create job description in the database for user {user_id}")
        return None

    
    import time
    time.sleep(0.1)

    logger.info(
        f"Background trigger thread started for job ID: {book_id}. Returning initial response to client NOW.")

    return str(book_id)


# def process_job_background_task(job_description_id_str: str):
#     """
#     The actual background task: fetches job, calls LLM, saves questions.
#     This is called by the /api/internal/process-job-background endpoint.
#     """
#     supabase_client = get_supabase_client()
#     question_repo = QuestionRepository(supabase_client)
#     job_desc_repo = JobDescriptionRepository(supabase_client)

#     try:
#         job_description_id = UUID(job_description_id_str)
#     except ValueError:
#         logger.error(f"Invalid UUID for background processing: {job_description_id_str}")
#         return

#     logger.info(f"Background: Starting processing for job {job_description_id}")
#     job_desc = job_desc_repo.get_by_id(job_description_id)

#     if not job_desc:
#         logger.error(f"Background: Job description {job_description_id} not found for processing.")
#         return

#     if job_desc.get('status') == 'completed':  # Avoid reprocessing
#         logger.info(f"Background: Job {job_description_id} already completed. Skipping.")
#         return

#     try:
#         job_desc_repo.update_status(job_description_id, "processing")

#         description_text = job_desc.get("description")
#         interview_prep_data: InterviewPreparation = generate_response(description_text)

#         if not interview_prep_data:
#             logger.error(f"Background: LLM failed for job {job_description_id}.")
#             job_desc_repo.update_status(job_description_id, "failed")
#             return

#         job_desc_repo.update_title(job_description_id, interview_prep_data["job_title"])

#         questions_to_insert = []

#         for bq in interview_prep_data["behavioral_questions"]:
#             questions_to_insert.append({
#                 "job_description_id": str(job_description_id),
#                 "content": bq["question"],
#                 "type": "Behavioral",
#                 "keyword": bq["category"],
#                 "explanation": bq["explanation"]
#             })

#         for tq in interview_prep_data["technical_questions"]:
#             questions_to_insert.append({
#                 "job_description_id": str(job_description_id),
#                 "content": tq["question"],
#                 "type": "Technical",
#                 "keyword": tq["skill_area"],
#                 "explanation": tq["explanation"]
#             })

#         if questions_to_insert:
#             question_repo.create_questions_batch(questions_to_insert)

#         job_desc_repo.update_status(job_description_id, "completed")
#         logger.info(f"Background: Successfully processed job {job_description_id}")

#     except Exception as e:
#         logger.error(f"Background: Error during processing job {job_description_id}: {e}")
#         try:
#             job_desc_repo.update_status(job_description_id, "failed")
#         except Exception as db_e:
#             logger.error(f"Background: Could not even update status to failed for {job_description_id}: {db_e}")


# def get_job_details(job_id_str: str) -> Optional[Dict]:
#     """
#     Retrieves job description, its status, and if completed, its generated questions
#     and formats it according to the frontend QuestionsResponse interface.
#     """

#     supabase_client = get_supabase_client()
#     job_desc_repo = JobDescriptionRepository(supabase_client)
#     question_repo = QuestionRepository(supabase_client)

#     try:
#         job_id = UUID(job_id_str)
#     except ValueError:
#         logger.warning(f"Invalid UUID format for job_id: {job_id_str}")
#         return None

#     logger.debug(f"Fetching details for job_id: {job_id}")
#     job_desc_data = job_desc_repo.get_by_id(job_id)

#     if not job_desc_data:
#         logger.warning(f"Job description not found for job_id: {job_id}")
#         return None

#     # Speech Token
#     speech_token_text = None
#     try:
#         speech_token_text = speech_service.get_speech_token()
#         logger.debug(f"Successfully fetched speech token for job {job_id}")
#     except ConnectionError as ce:
#         logger.error(f"Speech service connection error for job {job_id}: {str(ce)}")
#     except Exception as e:
#         logger.error(f"Failed to get speech token for job {job_id}: {str(e)}")

#     # Base Response Structure
#     response_shell = {
#         "status": job_desc_data.get("status", "unknown"),
#         "description": job_desc_data.get("description", ""),
#         "speech_token": speech_token_text,
#         "results": None  # Will be populated if status is 'completed'
#     }

#     # Populate Results if Completed ---
#     if response_shell["status"] == "completed":
#         db_questions = question_repo.get_questions_by_job_description_id(job_id)

#         behavioral_questions_list = []
#         technical_questions_list = []

#         for q_data in db_questions:
#             if q_data.get("type").lower() == "behavioral":
#                 behavioral_questions_list.append({
#                     "question": q_data.get("content"),
#                     "category": q_data.get("keyword"),
#                     "explanation": q_data.get("explanation")
#                 })
#             elif q_data.get("type").lower() == "technical":
#                 technical_questions_list.append({
#                     "question": q_data.get("content"),
#                     "skill_area": q_data.get("keyword"),
#                     "explanation": q_data.get("explanation")
#                 })

#         response_shell["results"] = {
#             "job_title": job_desc_data.get("title"),
#             "industry": "N/A",  # Placeholder
#             "experience_level": "N/A",  # Placeholder
#             "behavioral_questions": behavioral_questions_list,
#             "technical_questions": technical_questions_list,
#             "additional_notes": "N/A"  # Placeholder
#         }
#         logger.info(f"Successfully prepared completed job details for job_id: {job_id}")
#     else:
#         logger.info(f"Job {job_id} status is '{response_shell['status']}'. Results not populated.")

#     return response_shell

# def get_user_job_details():
#         """Fetch all job descriptions."""
#         supabase_client = get_supabase_client()
#         job_desc_repo = JobDescriptionRepository(supabase_client)

#         data = job_desc_repo.get_job_details()
#         if data:
#             job_desc_repo.logger.info(f"Fetched {len(data[1])} job descriptions.")
#             return data
#         else:
#             job_desc_repo.logger.warning(f"No job descriptions found.")
#             return None