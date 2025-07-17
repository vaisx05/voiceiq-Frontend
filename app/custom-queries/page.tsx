"use client";

import { useEffect, useState, useRef } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardShell } from "@/components/dashboard-shell";
import axios from "axios";
import { CheckCircle, Trash2, X, MessageCircle } from "lucide-react";
import { ConfirmModal } from "@/components/confirm-modal";
import { BASE_URL } from "@/lib/constants";
import { toast } from "sonner";

// Extract token from cookies
function getTokenFromCookies() {
  const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
  return match ? match[2] : null;
}

// Define the structure of a question
interface Question {
  id: string;
  question_text: string;
  is_active: boolean;
}

// Input field with auto-focus and cursor at the start
function AutoFocusInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      const input = inputRef.current;
      input.focus();
      input.setSelectionRange(0, 0);
    }
  }, []);

  return <Input ref={inputRef} value={value} onChange={onChange} className="mt-2" />;
}

export default function CustomQueries() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const [modalType, setModalType] = useState<"update" | "delete" | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [adding, setAdding] = useState(false);
  const [editedText, setEditedText] = useState("");

  // Auth headers
  const getAuthHeader = () => {
    const token = getTokenFromCookies();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch questions from backend
  const fetchQuestions = async () => {
    try {
      const response = await axios.get<Question[]>(`${BASE_URL}/get_all_questions`, {
        headers: getAuthHeader(),
      });
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

  const handleUpdate = (index: number) => {
    setPendingIndex(index);
    setEditedText(questions[index].question_text);
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
          editedText
        )}&is_active=${q.is_active}`,
        {},
        { headers: getAuthHeader() }
      );
      toast("Question updated successfully!");
      await fetchQuestions();
    } catch (err) {
      toast("Update failed");
      console.error(err);
    }
    setPendingIndex(null);
    setModalType(null);
    setEditedText("");
  };

  const handleConfirmDelete = async () => {
    if (pendingIndex === null) return;
    const q = questions[pendingIndex];
    try {
      await axios.delete(`${BASE_URL}/delete_question/${q.id}`, {
        headers: getAuthHeader(),
      });
      toast("Deleted successfully!");
      await fetchQuestions();
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
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-0">
        {/* Top Title + Button + Description */}
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-xl sm:text-2xl font-semibold">Custom Queries</h2>
          <Button
            variant="default"
            className="bg-blue-600 text-white"
            onClick={() => setShowAddModal(true)}
          >
            Add Question
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mb-2">
          Manage predefined questions used by the AI. Toggle to include/exclude them and edit as needed.
        </p>

        {/* Question List or Empty State */}
        <div className="mt-6">
          {questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12 border rounded-lg bg-muted/10">
              <MessageCircle className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No questions added yet.</h3>
              <p className="text-sm text-muted-foreground">
                Click the <span className="font-medium">“Add Question”</span> button at the top to create your first one.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {questions.map((q, index) => (
                <div key={q.id} className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-4">
                  <Input
                    value={q.question_text}
                    readOnly
                    className="flex-1 bg-gray-100 dark:bg-gray-800 cursor-default"
                  />
                  <Switch
                    checked={q.is_active}
                    onCheckedChange={() => handleToggle(index)}
                    className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=checked]:bg-blue-400"
                  />
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" onClick={() => handleUpdate(index)}>
                      Update
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(index)}
                      className="bg-red-600"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Question Modal */}
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
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Add New Question</h3>
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

      {/* Confirm Update Modal */}
      <ConfirmModal
        isOpen={modalType === "update" && pendingIndex !== null}
        onClose={() => {
          setPendingIndex(null);
          setModalType(null);
          setEditedText("");
        }}
        onConfirm={handleConfirmUpdate}
        title="Confirm Update"
        message="Edit your question below and confirm."
        highlightedText={<AutoFocusInput value={editedText} onChange={(e) => setEditedText(e.target.value)} />}
        icon={<CheckCircle className="text-green-500 w-6 h-6" />}
      />

      {/* Confirm Delete Modal */}
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
