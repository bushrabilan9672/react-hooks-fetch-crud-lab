import React, { useState, useEffect } from 'react';

function App() {
  const [questions, setQuestions] = useState([]);
  const [page, setPage] = useState("/questions");
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    prompt: "",
    answer1: "",
    answer2: "",
    answer3: "",
    answer4: "",
    correctIndex: 0
  });

  useEffect(() => {
    fetch("http://localhost:4000/questions")
      .then((r) => r.json())
      .then((data) => setQuestions(data));
  }, []);

  function handlePageChange(newPage) {
    setPage(newPage);
    setEditingQuestion(null);
    // Reset form when navigating to new question page
    if (newPage === "/questions/new") {
      setFormData({
        prompt: "",
        answer1: "",
        answer2: "",
        answer3: "",
        answer4: "",
        correctIndex: 0
      });
    }
  }

  function handleAddQuestion(newQuestion) {
    setQuestions([...questions, newQuestion]);
    setPage("/questions");
  }

  function handleDeleteQuestion(id) {
    fetch(`http://localhost:4000/questions/${id}`, {
      method: "DELETE"
    }).then(() => {
      const updatedQuestions = questions.filter((q) => q.id !== id);
      setQuestions(updatedQuestions);
    });
  }

  function handleUpdateAnswer(id, correctIndex) {
    const newIndex = parseInt(correctIndex);
    
    fetch(`http://localhost:4000/questions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correctIndex: newIndex })
    })
      .then((r) => r.json())
      .then(() => {
        const updatedQuestions = questions.map((q) => {
          if (q.id === id) {
            return { ...q, correctIndex: newIndex };
          }
          return q;
        });
        setQuestions(updatedQuestions);
      });
  }

  function handleEditQuestion(question) {
    // Populate form with question data
    setFormData({
      prompt: question.prompt,
      answer1: question.answers[0] || "",
      answer2: question.answers[1] || "",
      answer3: question.answers[2] || "",
      answer4: question.answers[3] || "",
      correctIndex: question.correctIndex
    });
    setEditingQuestion(question);
    setPage("/questions/new");
  }

  function handleUpdateQuestion(updatedQuestion) {
    const updatedQuestions = questions.map((q) =>
      q.id === updatedQuestion.id ? updatedQuestion : q
    );
    setQuestions(updatedQuestions);
    setEditingQuestion(null);
    setPage("/questions");
  }

  if (page === "/questions/new") {
    return (
      <main>
        <nav>
          <button onClick={() => handlePageChange("/questions")}>
            View Questions
          </button>
          <button onClick={() => handlePageChange("/questions/new")}>
            New Question
          </button>
        </nav>
        <QuestionForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={editingQuestion ? handleUpdateQuestion : handleAddQuestion}
          editingQuestion={editingQuestion}
        />
      </main>
    );
  }

  return (
    <main>
      <nav>
        <button onClick={() => handlePageChange("/questions")}>
          View Questions
        </button>
        <button onClick={() => handlePageChange("/questions/new")}>
          New Question
        </button>
      </nav>
      <section>
        <h1>Quiz Questions</h1>
        <ul>
          {questions.map((q) => (
            <QuestionItem
              key={q.id}
              question={q}
              onDelete={handleDeleteQuestion}
              onUpdate={handleUpdateAnswer}
              onEdit={handleEditQuestion}
            />
          ))}
        </ul>
      </section>
    </main>
  );
}

function QuestionForm({ formData, setFormData, onSubmit, editingQuestion }) {
  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    
    const questionData = {
      prompt: formData.prompt,
      answers: [
        formData.answer1,
        formData.answer2,
        formData.answer3,
        formData.answer4
      ],
      correctIndex: parseInt(formData.correctIndex)
    };

    if (editingQuestion) {
      // Update existing question
      fetch(`http://localhost:4000/questions/${editingQuestion.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionData)
      })
        .then((r) => r.json())
        .then((data) => onSubmit(data));
    } else {
      // Create new question
      fetch("http://localhost:4000/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionData)
      })
        .then((r) => r.json())
        .then((data) => onSubmit(data));
    }
  }

  return (
    <section>
      <h1>{editingQuestion ? "Edit Question" : "New Question"}</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Prompt:
          <input
            type="text"
            name="prompt"
            value={formData.prompt}
            onChange={handleChange}
          />
        </label>
        <label>
          Answer 1:
          <input
            type="text"
            name="answer1"
            value={formData.answer1}
            onChange={handleChange}
          />
        </label>
        <label>
          Answer 2:
          <input
            type="text"
            name="answer2"
            value={formData.answer2}
            onChange={handleChange}
          />
        </label>
        <label>
          Answer 3:
          <input
            type="text"
            name="answer3"
            value={formData.answer3}
            onChange={handleChange}
          />
        </label>
        <label>
          Answer 4:
          <input
            type="text"
            name="answer4"
            value={formData.answer4}
            onChange={handleChange}
          />
        </label>
        <label>
          Correct Answer:
          <select
            name="correctIndex"
            value={formData.correctIndex}
            onChange={handleChange}
          >
            <option value="0">Answer 1</option>
            <option value="1">Answer 2</option>
            <option value="2">Answer 3</option>
            <option value="3">Answer 4</option>
          </select>
        </label>
        <button type="submit">
          {editingQuestion ? "Update Question" : "Add Question"}
        </button>
      </form>
    </section>
  );
}

function QuestionItem({ question, onDelete, onUpdate, onEdit }) {
  function handleDelete() {
    onDelete(question.id);
  }

  function handleAnswerChange(e) {
    onUpdate(question.id, parseInt(e.target.value));
  }

  function handleEdit() {
    onEdit(question);
  }

  const selectValue = question.correctIndex.toString();

  return (
    <li>
      <h4>Question {question.id}</h4>
      <h5>Prompt: {question.prompt}</h5>
      <label>
        Correct Answer:
        <select
          value={selectValue}
          onChange={handleAnswerChange}
          aria-label="Correct Answer"
        >
          {question.answers.map((answer, index) => (
            <option key={index} value={index.toString()}>
              {answer}
            </option>
          ))}
        </select>
      </label>
      <button onClick={handleEdit}>Edit Question</button>
      <button onClick={handleDelete}>Delete Question</button>
    </li>
  );
}

export default App;