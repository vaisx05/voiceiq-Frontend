"use client";

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardShell } from "@/components/dashboard-shell";
import axios from "axios";
import { CheckCircle, Trash2, X } from "lucide-react";
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
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const [modalType, setModalType] = useState<"update" | "delete" | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [adding, setAdding] = useState(false);


  // Always get token before making a request
  const getAuthHeader = () => {
    const token = getTokenFromCookies();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };
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

  useEffect(() => {
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
    setPendingIndex(index);
    setModalType("update");
  };

  const handleDelete = (index: number) => {
    setPendingIndex(index);
    setModalType("delete");
  };

  const handleConfirmUpdate = async () => {
    if (pendingIndex === null) return;
    const q = questions[pendingIndex];
    try {
      await axios.put(
        `${BASE_URL}/update_question/${q.id}?question_text=${encodeURIComponent(
          q.question_text
        )}&is_active=${q.is_active}`,
        {},
        { headers: getAuthHeader() }
      );
      toast("Question updated successfully!");
      await fetchQuestions(); // <-- refetch after update
    } catch (err) {
      toast("Update failed");
      console.error(err);
    }
    setPendingIndex(null);
    setModalType(null);
  };

  const handleConfirmDelete = async () => {
    if (pendingIndex === null) return;
    const q = questions[pendingIndex];
    try {
      await axios.delete(`${BASE_URL}/delete_question/${q.id}`, {
        headers: getAuthHeader(),
      });
      toast("Deleted successfully!");
      await fetchQuestions(); // <-- refetch after delete
    } catch (err) {
      toast("Delete failed");
      console.error(err);
    }
    setPendingIndex(null);
    setModalType(null);
  };

  const handleAddQuestion = async () => {
    if (!newQuestionText.trim()) return;
    setAdding(true);
    try {
      await axios.post(
        `${BASE_URL}/add_question`,
        { question_text: newQuestionText },
        { headers: getAuthHeader() }
      );
      toast("Question added successfully!");
      setNewQuestionText("");
      setShowAddModal(false);
      await fetchQuestions();
    } catch (err) {
      toast("Add failed");
      console.error(err);
    }
    setAdding(false);
  };

  return (
    <DashboardShell>
      <div className="px-4 sm:px-6 py-6 max-w-5xl">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl sm:text-2xl font-semibold">Custom Queries</h2>
          <Button
            variant="default"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setShowAddModal(true)}
          >
            Add Question
          </Button>
        </div>
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

      {/* Add Question Modal Overlay */}
      {showAddModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 dark:bg-opacity-60">
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 w-full max-w-md relative border border-gray-200 dark:border-gray-700">
      <button
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        onClick={() => {
          setShowAddModal(false);
          setNewQuestionText("");
        }}
        disabled={adding}
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Add New Question
      </h3>
      <Input
        value={newQuestionText}
        onChange={(e) => setNewQuestionText(e.target.value)}
        placeholder="Type your new question"
        className="mb-4"
        disabled={adding}
      />
      <div className="flex gap-2 justify-end">
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={handleAddQuestion}
          disabled={adding || !newQuestionText.trim()}
        >
          {adding ? "Adding..." : "Add"}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setShowAddModal(false);
            setNewQuestionText("");
          }}
          disabled={adding}
        >
          Cancel
        </Button>
      </div>
    </div>
  </div>
)}


<ConfirmModal
  isOpen={modalType === "update" && pendingIndex !== null}
  onClose={() => {
    setPendingIndex(null);
    setModalType(null);
  }}
  onConfirm={handleConfirmUpdate}
  title="Confirm Update"
  message={`Are you sure you want to update this question?`}
  highlightedText={`"${questions[pendingIndex!]?.question_text}"`} 
  icon={<CheckCircle className="text-green-500 w-6 h-6" />}
/>



    <ConfirmModal
  isOpen={modalType === "delete" && pendingIndex !== null}
  onClose={() => {
    setPendingIndex(null);
    setModalType(null);
  }}
  onConfirm={handleConfirmDelete}
  title="Confirm Delete"
  message="Are you sure you want to delete this question?"
  highlightedText={`"${questions[pendingIndex!]?.question_text}"`}
  icon={<Trash2 className="text-red-500 w-6 h-6" />}
/>

    </DashboardShell>
  );
}