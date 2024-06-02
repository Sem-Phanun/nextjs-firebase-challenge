'use client';
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import React, { useState, ChangeEvent, useEffect, FormEvent } from 'react';
import { v4 as uuidv4 } from 'uuid'
import { db } from '../firebase/firebase';

interface Todo {
  id: string;
  todo: string;
  isCompleted: boolean;
  createAt: Date;
}
const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filterTodo, setFilterTodo] = useState<Todo[]>([])
  const [inputTodo, setInputTodo] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editById, setEditById] = useState<string | null>(null);

  useEffect(() => {
    getAllTodoList();
  }, []);

  const getAllTodoList = async (): Promise<void> => {
    try {
      const querySnapshot = await getDocs(collection(db, 'todos'));
      const todosData: Todo[] = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      
      console.log("data", todosData);
      setTodos(todosData);
      setFilterTodo(todosData)
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };
  

  const handleSubmit = (e: ChangeEvent<HTMLInputElement>) => {
    setInputTodo(e.target.value);
    queryFilter(e.target.value);
  };
  const handleInput = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedInput = inputTodo.trim().toLowerCase();
    if (!trimmedInput) {
      alert("Todo list can't be empty");
      return;
    }

    const isDuplicate = todos.some((todo) => todo.todo.toLowerCase() === trimmedInput.toLowerCase());
    if (isDuplicate) {
      alert("Item can't be duplicate");
      return;
    }

    try{
      if(isEditing && editById){
        await updateExistingTodo()
      }else{
        await createNewTodo()
      }
    }catch(error){
      console.log("error update or add todo", error)
    }

    setInputTodo('')
  };

  //Create new Todo
  const createNewTodo = async (): Promise<void> => {
    const newTodo: Todo = {
      id: uuidv4(),
      todo: inputTodo,
      isCompleted: false,
      createAt: new Date()
    };
    try{
      await addDoc(collection(db, 'todos'), newTodo)
      getAllTodoList()
    }catch(err){
      console.log('Error adding new todo:', err)
    }
  }

  //Update existing Todo function
  const updateExistingTodo = async () => {
    try{
      const todoDoc = doc(db, 'todos', editById);
      await updateDoc(todoDoc, { todo: inputTodo });

      const updatedTodos = todos.map(todo =>
        todo.id === editById ? { todo: inputTodo } : todo
      );

      setTodos(updatedTodos)
      setFilterTodo(updatedTodos)
      getAllTodoList()
      setIsEditing(false);
      setEditById(null);
    }catch(err){
      console.log('error update existing todo ', err)
    }
  }

  const handleOnComplete = async (id: string) => {
    const updatedTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
    );
    setTodos(updatedTodos);
    setFilterTodo(updatedTodos);
  } 

  const handleEditTodo = async (id: string) => {
    const itemToEdit = todos.find((todo) => todo.id === id);
    if (itemToEdit) {
      setInputTodo(itemToEdit.todo);
      console.log('itemToEdit: ', itemToEdit.todo);
      setIsEditing(true);
      setEditById(id);
    }
  }

  const handleDeleteTodo = async (id: string) => {
    await deleteDoc(doc(db, 'todos', id));
    const tmp_data = todos.filter(todo => todo.id !== id)
    setTodos(tmp_data);
    setFilterTodo(tmp_data)
  }

  // Helper to filter todos
  const helperFilter = (query: string, like: string) => {
    let i = 0;
    for (let j = 0; j < like.length; j++) {
      if (query[i] === like[j]) {
        i++;
      }
    }
    return i === query.length;
  };

  // Filter todos based on input text
  const queryFilter = (input: string) => {
    if (input.trim() === '') {
      setFilterTodo(todos);
      return;
    }
    const result = todos.filter((todo) =>
      helperFilter(input.toLowerCase(), todo.todo.toLowerCase())
    );
    setFilterTodo(result);
  };

  return (
    <main className="bg-slate-100 max-w-[600px] w-full m-auto rounded-md shadow-xl p-4">
      <form onSubmit={handleInput} className="flex justify-between">
        <input
          type="text"
          value={inputTodo}
          onChange={handleSubmit}
          className="border p-2 w-full text-xl outline-none"
        />
        <button
          type="submit"
          className="border p-4 ml-2 bg-purple-500 text-slate-100"
        >
          {isEditing ? 'Update' : 'Add'}
        </button>
      </form>
      <ul>
      {filterTodo.length > 0 ? (
          filterTodo.map((item, index) => (
            <div key={index}>
              <li className="flex justify-between bg-slate-200 p-4 my-2 capitalize items-center">
                <span className={item.isCompleted ? 'line-through' : ''}>
                  {item.todo}
                </span>
                <button
                  onClick={() => handleOnComplete(item.id)}
                  className="border p-2 ml-2 bg-purple-500 text-slate-100 cursor-pointer flex items-center"
                >
                  {item.isCompleted ? 'Mark as Complete' : 'Mark as InComplete'}
                </button>
                <button
                  onClick={() => handleEditTodo(item.id)}
                  className="border p-2 ml-2 bg-blue-500 text-slate-100 cursor-pointer flex items-center"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteTodo(item.id)}
                  className="border p-2 ml-2 bg-red-500 text-slate-100 cursor-pointer flex items-center"
                >
                  Delete
                </button>
              </li>
            </div>
          ))
        ) : (
          <li>No result. Create a new one instead!</li>
        )}
      </ul>
    </main>
  );
};
export default TodoList;
