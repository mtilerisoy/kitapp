// src/app/read/[bookId]/page.tsx

'use client';

import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/api';
import { Book, Rendition, Location } from 'epubjs';
import { debounce } from 'lodash';
import { PacmanLoader } from 'react-spinners';
import { AxiosError } from 'axios';
import { IoArrowBack, IoChevronBack, IoChevronForward } from "react-icons/io5";
import { cn } from '@/lib/utils';

// --- Type Definitions ---
interface ReadUrlResponse {
  signed_url: string;
}
interface UpdatePayload {
  bookId: string;
  progress: number;
}
interface ApiError {
  error: {
    type: string;
    message: string;
    code: string;
    request_id?: string;
  };
}

// --- API Functions (No Changes) ---
const fetchBookContent = async (bookId: string): Promise<ArrayBuffer> => {
  const { data: urlResponse } = await apiClient.get<ReadUrlResponse>(`/api/books/${bookId}/read`);
  const signedUrl = urlResponse.signed_url;

  if (!signedUrl) throw new Error('Signed URL was not provided by the server.');

  const fileResponse = await fetch(signedUrl);
  if (!fileResponse.ok) throw new Error(`Failed to download book content. Status: ${fileResponse.status}`);
  
  return fileResponse.arrayBuffer();
};

const updateBookProgress = async (payload: UpdatePayload) => {
  const { bookId, ...updates } = payload;
  await apiClient.patch(`/api/my-books/${bookId}`, updates);
};

// --- The Main Reader Component ---
export default function ReaderPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.bookId as string;
  
  const viewerRef = useRef<HTMLDivElement>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const bookInstanceRef = useRef<Book | null>(null);
  const hideUiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // SYNTH-STACK: State management for the new UI
  const [isUiVisible, setIsUiVisible] = useState(true);
  const [metadata, setMetadata] = useState<{ title: string; author: string } | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [totalLocations, setTotalLocations] = useState(0);
  const [currentChapterLabel, setCurrentChapterLabel] = useState('Loading...');

  const { data: bookData, isLoading, isError, error } = useQuery<ArrayBuffer, Error>({
    queryKey: ['bookContent', bookId],
    queryFn: () => fetchBookContent(bookId),
    enabled: !!bookId,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const { mutate: patchProgress } = useMutation<void, AxiosError<ApiError>, UpdatePayload>({
    mutationFn: updateBookProgress,
  });

  const debouncedUpdate = useCallback(
    debounce((progress: number) => {
      if (progress > 0) patchProgress({ bookId, progress });
    }, 5000),
    [bookId, patchProgress]
  );
  
  useEffect(() => {
    const loadBook = async () => {
      if (bookData && viewerRef.current) {
        const book = new Book();
        bookInstanceRef.current = book;
        try {
          await book.open(bookData, 'binary');

          const rendition = book.renderTo(viewerRef.current, {
            width: '100%',
            height: '100%',
            flow: "paginated",
            allowScriptedContent: true,
          });
          renditionRef.current = rendition;

          await book.ready;
          // SYNTH-STACK: Populate UI state from the loaded book
          setMetadata({ title: book.packaging.metadata.title, author: book.packaging.metadata.creator });
          const locations = await book.locations.generate(1650);
          setTotalLocations(locations.length);
          
          rendition.on('relocated', (location: Location) => {
            setCurrentLocation(location);
            const chapter = book.navigation.get(location.start.cfi);
            if (chapter && chapter.label) {
                setCurrentChapterLabel(chapter.label.trim());
            }
            if (book.locations) {
              const progress = book.locations.percentageFromCfi(location.start.cfi);
              debouncedUpdate(Math.round(progress * 100));
            }
          });
          rendition.display();
        } catch (e) { console.error("Error loading EPUB:", e); }
      }
    };
    loadBook();
    return () => { bookInstanceRef.current?.destroy(); };
  }, [bookData, debouncedUpdate]);

  // SYNTH-STACK: Effect to auto-hide the UI chrome
  const handleMouseMove = () => {
    if (hideUiTimeoutRef.current) clearTimeout(hideUiTimeoutRef.current);
    setIsUiVisible(true);
    hideUiTimeoutRef.current = setTimeout(() => setIsUiVisible(false), 3000);
  };
  
  useEffect(() => {
    handleMouseMove(); // Show UI on initial load
    return () => { if (hideUiTimeoutRef.current) clearTimeout(hideUiTimeoutRef.current); };
  }, []);

  const progressPercent = useMemo(() => {
    if (!currentLocation || totalLocations === 0) return 0;
    // Use the location object's own percentage if available, fallback to calculation
    if (currentLocation.start.percentage) return Math.round(currentLocation.start.percentage * 100);
    return Math.round((currentLocation.start.location / totalLocations) * 100);
  }, [currentLocation, totalLocations]);

  const nextPage = () => renditionRef.current?.next();
  const prevPage = () => renditionRef.current?.prev();

  if (isLoading) return <div className="w-full h-full flex justify-center items-center bg-gray-100"><PacmanLoader color="#36D7B7" size={50} /></div>;
  if (isError) {
    // Try to extract the new error format from AxiosError
    let errorMessage = error.message;
    let errorCode = '';
    let requestId = '';
    if ((error as any).response?.data?.error) {
      errorMessage = (error as any).response.data.error.message || errorMessage;
      errorCode = (error as any).response.data.error.code || '';
      requestId = (error as any).response.data.error.request_id || '';
    }
    return (
      <div className="w-full h-full flex justify-center items-center text-red-600 p-8 text-center bg-gray-100">
        Error: {errorMessage}
        {errorCode && <div className="text-xs mt-2">Code: {errorCode}</div>}
        {requestId && <div className="text-xs mt-1">Request ID: {requestId}</div>}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-[#FBF7EE]" onMouseMove={handleMouseMove}>
      {/* SYNTH-STACK: Header UI */}
      <header className={cn("fixed top-0 left-0 right-0 z-20 p-4 bg-white/80 backdrop-blur-sm shadow-sm transition-opacity duration-300", isUiVisible ? "opacity-100" : "opacity-0 pointer-events-none")}>
        <div className="flex items-center justify-between">
            <button onClick={() => router.push('/my-books')} className="flex items-center gap-2 text-gray-700 hover:text-black">
                <IoArrowBack size={24} />
                <span className="font-semibold">Back to Library</span>
            </button>
            <div className="text-center">
                <h1 className="font-bold text-lg truncate">{metadata?.title}</h1>
                <p className="text-sm text-gray-600">{metadata?.author}</p>
            </div>
            <div className="w-32"></div> {/* Spacer */}
        </div>
      </header>

      {/* Main viewer area */}
      <div className="w-full h-full flex items-center justify-center pt-20 pb-20">
        <div ref={viewerRef} className="w-full h-[calc(100%-2rem)] max-w-4xl shadow-lg" />
      </div>

      {/* SYNTH-STACK: Visible Navigation Buttons */}
      <button onClick={prevPage} className={cn("fixed left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/20 text-white rounded-full hover:bg-black/40 transition-opacity duration-300", isUiVisible ? "opacity-100" : "opacity-0 pointer-events-none")} aria-label="Previous Page">
        <IoChevronBack size={32} />
      </button>
      <button onClick={nextPage} className={cn("fixed right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/20 text-white rounded-full hover:bg-black/40 transition-opacity duration-300", isUiVisible ? "opacity-100" : "opacity-0 pointer-events-none")} aria-label="Next Page">
        <IoChevronForward size={32} />
      </button>

      {/* SYNTH-STACK: Footer UI with Progress */}
      <footer className={cn("fixed bottom-0 left-0 right-0 z-20 p-4 bg-white/80 backdrop-blur-sm shadow-sm transition-opacity duration-300", isUiVisible ? "opacity-100" : "opacity-0 pointer-events-none")}>
        <div className="flex flex-col items-center gap-2">
            <span className="text-sm text-gray-700 truncate max-w-full px-4">{currentChapterLabel}</span>
            <div className="w-full max-w-2xl flex items-center gap-4">
                <span className="text-xs font-mono">{progressPercent}%</span>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${progressPercent}%` }}></div>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
}