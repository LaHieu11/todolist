import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UilCheckCircle, UilEdit, UilTrashAlt } from '@iconscout/react-unicons';
import "./App.css";

export default function TodoList() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [checkedStates, setCheckedStates] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');



  const handleSubmit = () => {
    if (task.trim() === '') {
      setError(true);
      setErrorMessage('Task can not be null');
      return;
    }

    if (!validateInput(task)) {
      setError(true);
      setErrorMessage('Invalid format');
      return;
    }

    const dataToSave = {
      name: task,
    };

    axios
      .post('http://localhost:9999/items', dataToSave)
      .then((response) => {
        console.log(response.data);
        setTasks((prevTasks) => [...prevTasks, response.data]);
        setTask('');
        setError(false);
        setErrorMessage('');
      })
      .catch((error) => {
        console.error('Error saving data:', error);
        setError(true);
        setErrorMessage('Error saving data.');
      });
  };

  const handleChange = (index, value) => {
    // Nếu đang ở chế độ chỉnh sửa, chỉ cập nhật editValue
    if (editingIndex !== null) {
      setEditValue(value);
    } else {
      setCheckedStates((prev) => {
        const newCheckedStates = [...prev];
        newCheckedStates[index] = !newCheckedStates[index];
        return newCheckedStates;
      });

      // If not in edit mode, update the task name
      if (editingIndex !== index) {
        const taskId = tasks[index].id;
        const updatedTask = { name: value };

        axios
          .put(`http://localhost:9999/items/${taskId}`, updatedTask)
          .then((response) => {
            setTasks((prevTasks) => {
              const newTasks = [...prevTasks];
              newTasks[index] = response.data;
              return newTasks;
            });
          })
          .catch((error) => {
            console.error('Error updating data:', error);
          });
      }

      // Clear error if input is valid
      if (!validateInput(value)) {
        setError(true);
        setErrorMessage('Invalid format');
        return;
      }

      setError(false);
      setErrorMessage('');
    }
  };




  const handleRemove = (index) => {
    const taskId = tasks[index].id;

    axios.delete(`http://localhost:9999/items/${taskId}`)
      .then((response) => {
        setTasks((prevTasks) => prevTasks.filter((task, i) => i !== index));
      })
      .catch((error) => {
        console.error('Lỗi khi xóa dữ liệu:', error);
      });
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setEditValue(tasks[index].name);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null) {
      // Update the task on the server
      const taskId = tasks[editingIndex].id;
      const updatedTask = { name: editValue };

      // Check for valid input before making the update
      if (!validateInput(editValue)) {
        setError(true);
        setErrorMessage('Invalid input format');
        return;
      }

      axios
        .put(`http://localhost:9999/items/${taskId}`, updatedTask)
        .then((response) => {
          // Update the tasks in the state
          setTasks((prevTasks) => {
            const newTasks = [...prevTasks];
            newTasks[editingIndex] = response.data;
            return newTasks;
          });

          // Reset the editing state
          setEditingIndex(null);
          setEditValue('');

          // Clear the error state
          setError(false);
          setErrorMessage('');
        })
        .catch((error) => {
          console.error('Error updating data:', error);
        });
    }
  };





  const changeStyle = (index) => {
    setCheckedStates(prev => {
      const newCheckedStates = [...prev];
      newCheckedStates[index] = !newCheckedStates[index];
      return newCheckedStates;
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
    }
  };

  const handleKeyPress2 = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); 
      handleSubmit(); 
    }
  };


  useEffect(() => {
    axios.get('http://localhost:9999/items')
      .then((response) => {
        setTasks(response.data);
        setCheckedStates(Array(response.data.length).fill(false));
      })
      .catch((error) => {
        console.error('Lỗi khi fetch dữ liệu:', error);
      });
  }, []);

  const validateInput = (input) => {
    // Định dạng yêu cầu: Chữ hoa đầu, chữ thường sau, có thể có dấu cách, có thể có số, không có ký tự đặc biệt
    const regex = /^[A-Z][a-zÀ-ỹ0-9\s]*$/;
    return regex.test(input);
  };



  return (
    <div className="todo-list">
      <div className="todo-list__content">
        <h1 className="todo-list__title">Todo-list</h1>
        <div className="todo-list__input">
          <input
            value={task}
            onChange={(e) => setTask(e.target.value)}
            onKeyPress={handleKeyPress2}
            className="todo-list__input-box"
            placeholder="Enter a to do"
          ></input>
          <button
            onClick={handleSubmit}
            className='todo-list__AddButton'
            type="submit"
          >
            Add
          </button>
        </div>
        {error && <p className='error'>{errorMessage}</p>}
        <div className="todo-list__task-container">
          {Array.isArray(tasks) && tasks.length > 0 && tasks.map((task, index) => (
            <div className="todo-list__task" key={index}>
              {editingIndex === index ? (
                <>
                  <input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="todo-list__edit-input"
                    onKeyPress={handleKeyPress}
                  />
                  <button onClick={handleSaveEdit}>Save</button>
                </>
              ) : (
                <>
                  <input
                    value={task.name}
                    // onChange={(e) => handleChange(index, e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    className={`todo-list__task-input ${checkedStates[index] ? 'todo-list__task--completed' : ''}`}
                  />
                  <div className="todo-list__icon-list">
                    <button
                      className="todo-list__check-box"
                      onClick={() => changeStyle(index)}
                    >
                      <UilCheckCircle></UilCheckCircle>
                    </button>
                    <button
                      className="todo-list__edit-box"
                      onClick={() => handleEdit(index)}
                    >
                      <UilEdit></UilEdit>
                    </button>
                    <button
                      className="todo-list__remove-box"
                      onClick={() => handleRemove(index)}
                    >
                      <UilTrashAlt></UilTrashAlt>
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}