"use client";
import axios from "axios";
import { useEffect, useState } from "react";

interface Todo {
  userId?: number;
  id: number;
  title: string;
  completed: boolean;
}

export default function Home() {
  const [toDos, setToDos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState<string>("");
  const [newCompleted, setNewCompleted] = useState<boolean>(false);

  useEffect(() => {
    fetchToDos();
  }, []);

  const fetchToDos = async () => {
    try {
      const response = await axios.get<Todo[]>(
        "https://jsonplaceholder.typicode.com/todos?_limit=10"
      );
      setToDos(response.data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  const addToDo = async () => {
    if (!newTitle.trim()) return;

    const newTodo: Omit<Todo, "id"> = {
      userId: 1,
      title: newTitle,
      completed: newCompleted,
    };

    const tempId = Date.now();
    const tempTodo: Todo = { ...newTodo, id: tempId };

    setToDos((prev) => [...prev, tempTodo]);

    try {
      const response = await axios.post<Todo>(
        "https://jsonplaceholder.typicode.com/todos",
        newTodo
      );
      setToDos((prev) =>
        prev.map((todo) => (todo.id === tempId ? response.data : todo))
      );
    } catch (error) {
      console.error("Error adding todo:", error);
      setToDos((prev) => prev.filter((todo) => todo.id !== tempId));
    }

    setNewTitle("");
  };

  const deleteTodo = async (id: number) => {
    const previousTodos = [...toDos];
    setToDos((prev) => prev.filter((todo) => todo.id !== id));

    try {
      await axios.delete(`https://jsonplaceholder.typicode.com/todos/${id}`);
    } catch (error) {
      console.error("Error deleting todo:", error);
      setToDos(previousTodos);
    }
  };

  const toggleCompleted = async (id: number) => {
    setToDos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );

    try {
      await axios.patch(`https://jsonplaceholder.typicode.com/todos/${id}`, {
        completed: !toDos.find((todo) => todo.id === id)?.completed,
      });
    } catch (error) {
      console.error("Error updating todo status:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-8">📝 Todo App</h1>

      <div className="w-full max-w-lg bg-gray-200 p-6 rounded-lg shadow-md">
        <input
          type="text"
          placeholder="Enter new task..."
          className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <div className="flex justify-center items-center mt-4">
          <button
            onClick={addToDo}
            disabled={!newTitle.trim()}
            className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 cursor-pointer transition"
          >
            Add Todo
          </button>
        </div>
      </div>

      <div className="w-full max-w-lg mt-8">
        {toDos.map((todo) => (
          <div
            key={todo.id}
            className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center mb-4 cursor-pointer transition hover:bg-gray-100"
          >
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleCompleted(todo.id)}
                className="h-5 w-5"
              />
              <div className="max-w-56">
                <h2
                  className={`text-lg font-semibold break-words ${
                    todo.completed ? "line-through text-gray-400" : "text-black"
                  }`}
                >
                  {todo.title}
                </h2>
                <p className="text-gray-500">
                  {todo.completed ? "✅ Completed" : "❌ Not completed"}
                </p>
              </div>
            </div>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="text-white bg-red-500 hover:bg-red-900 rounded-lg px-3 py-1 transition"
            >
              🗑️ Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
