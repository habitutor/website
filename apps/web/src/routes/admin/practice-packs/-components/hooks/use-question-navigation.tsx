import { useEffect, useState } from "react";

type UseQuestionNavigationOptions = {
  totalQuestions: number;
  currentIndex: number;
  onNavigate: (index: number) => void;
  gridSize?: number;
};

export function useQuestionNavigation({
  totalQuestions,
  currentIndex,
  onNavigate,
  gridSize = 30,
}: UseQuestionNavigationOptions) {
  const [gridPage, setGridPage] = useState(0);

  useEffect(() => {
    if (totalQuestions > 0) {
      setGridPage(0);
    }
  }, [totalQuestions]);

  useEffect(() => {
    if (totalQuestions === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && currentIndex > 0) {
        const newIndex = currentIndex - 1;
        onNavigate(newIndex);
        setGridPage(Math.floor(newIndex / gridSize));
      } else if (e.key === "ArrowRight" && currentIndex < totalQuestions - 1) {
        const newIndex = currentIndex + 1;
        onNavigate(newIndex);
        setGridPage(Math.floor(newIndex / gridSize));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, totalQuestions, onNavigate, gridSize]);

  const handleQuestionClick = (index: number) => {
    onNavigate(index);
    setGridPage(Math.floor(index / gridSize));
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      onNavigate(newIndex);
      setGridPage(Math.floor(newIndex / gridSize));
    }
  };

  const goToNext = () => {
    if (currentIndex < totalQuestions - 1) {
      const newIndex = currentIndex + 1;
      onNavigate(newIndex);
      setGridPage(Math.floor(newIndex / gridSize));
    }
  };

  const goToPreviousGridPage = () => {
    if (gridPage > 0) {
      setGridPage(gridPage - 1);
    }
  };

  const goToNextGridPage = () => {
    const totalPages = Math.ceil(totalQuestions / gridSize);
    if (gridPage < totalPages - 1) {
      setGridPage(gridPage + 1);
    }
  };

  return {
    gridPage,
    setGridPage,
    handleQuestionClick,
    goToPrevious,
    goToNext,
    goToPreviousGridPage,
    goToNextGridPage,
    totalGridPages: Math.ceil(totalQuestions / gridSize),
    startIndex: gridPage * gridSize,
    endIndex: Math.min(gridPage * gridSize + gridSize, totalQuestions),
  };
}
