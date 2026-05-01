import { useCallback, useState } from "react";
import { emptyStoryRisksRow, type StoryRisksItem } from "@/components/profile/create-campaign/types";

export function useKeyedRows(initial: StoryRisksItem[] = [emptyStoryRisksRow]) {
  const [rows, setRows] = useState<StoryRisksItem[]>(initial);

  const updateRow = useCallback((index: number, field: keyof StoryRisksItem, value: string) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }, []);

  const addRow = useCallback(() => {
    setRows((prev) => [...prev, { ...emptyStoryRisksRow }]);
  }, []);

  const removeRow = useCallback((index: number) => {
    setRows((prev) => (prev.length <= 1 ? [{ ...emptyStoryRisksRow }] : prev.filter((_, i) => i !== index)));
  }, []);

  return { rows, setRows, updateRow, addRow, removeRow };
}
