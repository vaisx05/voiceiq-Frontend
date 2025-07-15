"use client";

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardShell } from "@/components/dashboard-shell";
import axios from "axios";
import { CheckCircle, Trash2 } from "lucide-react";
import { ConfirmModal } from "@/components/confirm-modal";
import { BASE_URL } from "@/lib/constants";
import { toast } from "sonner";

// Helper to get token from cookies
function getTokenFromCookies() {
  const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
  return match ? match[2] : null;
}

interface Question {
  id: string;
  question_text: string;
  is_active: boolean;
}

export default function CustomQueries() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [pendingUpdateIndex, setPendingUpdateIndex] = useState<number | null>(null);

  // Always get token before making a request
  const getAuthHeader = () => {
    const token = getTokenFromCookies();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get<Question[]>(
          `${BASE_URL}/get_all_questions`,
          { headers: getAuthHeader() }
        );
        const formatted = response.data.map((q: any) => ({
          id: q.id,
          question_text: q.question_text,
          is_active: q.is_active === true,
        }));
        setQuestions(formatted);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    fetchQuestions();
  }, []);

  const handleToggle = (index: number) => {
    const updated = [...questions];
    updated[index].is_active = !updated[index].is_active;
    setQuestions(updated);
  };

  const handleInputChange = (index: number, newText: string) => {
    const updated = [...questions];
    updated[index].question_text = newText;
    setQuestions(updated);
  };

  const handleUpdate = (index: number) => {
    setPendingUpdateIndex(index);
  };

  const handleConfirmUpdate = async (index: number | null) => {
    if (index === null) return;
    const q = questions[index];
    try {
      await axios.put(
        `${BASE_URL}/update_question/${q.id}?question_text=${encodeURIComponent(
          q.question_text
        )}&is_active=${q.is_active}`,
        {},
        { headers: getAuthHeader() }
      );
      toast("Question updated successfully!");
    } catch (err) {
      alert("Update failed");
      console.error(err);
    }
    setPendingUpdateIndex(null);
  };

  const handleDelete = (index: number) => {
    setPendingUpdateIndex(index);
  };

  const handleConfirmDelete = async (index: number | null) => {
    if (index === null) return;
    const q = questions[index];
    try {
      await axios.delete(`${BASE_URL}/delete_question/${q.id}`, {
        headers: getAuthHeader(),
      });
      const updated = questions.filter((_, i) => i !== index);
      setQuestions(updated);
      alert("Deleted successfully!");
    } catch (err) {
      alert("Delete failed");
      console.error(err);
    }
    setPendingUpdateIndex(null);
  };

  return (
    <DashboardShell>
      <div className="px-4 sm:px-6 py-6 max-w-5xl">
        <h2 className="text-xl sm:text-2xl font-semibold mb-2">Custom Queries</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Manage predefined questions used by the AI. Toggle to include/exclude them and edit as needed.
        </p>

        <div className="space-y-4">
          {questions.map((q, index) => (
            <div
              key={q.id}
              className="flex items-center gap-3 sm:gap-4 border p-4 rounded-xl shadow-sm"
            >
              <Input
                value={q.question_text}
                onChange={(e) => handleInputChange(index, e.target.value)}
                className="flex-1"
              />
              <Switch
                checked={q.is_active}
                onCheckedChange={() => handleToggle(index)}
                className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=checked]:bg-blue-400"
              />
              <Button variant="secondary" size="sm" onClick={() => handleUpdate(index)}>
                Update
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(index)}>
                Delete
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Update Confirm Modal */}
      <ConfirmModal
        isOpen={pendingUpdateIndex !== null}
        onClose={() => setPendingUpdateIndex(null)}
        onConfirm={() => handleConfirmUpdate(pendingUpdateIndex)}
        title="Confirm Update"
        message={`Are you sure you want to update this question?\n"${questions[pendingUpdateIndex!]?.question_text}" – ${questions[pendingUpdateIndex!]?.is_active ? "Active" : "Inactive"}`}
        icon={<CheckCircle className="text-green-500 w-6 h-6" />}
      />

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={pendingUpdateIndex !== null}
        onClose={() => setPendingUpdateIndex(null)}
        onConfirm={() => handleConfirmDelete(pendingUpdateIndex)}
        title="Confirm Delete"
        message={`Are you sure you want to delete this question?\n"${questions[pendingUpdateIndex!]?.question_text}"`}
        icon={<Trash2 className="text-red-500 w-6 h-6" />}
      />
    </DashboardShell>
  );
}