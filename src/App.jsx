import React, { useState, useEffect } from "react";
import axios from "axios"; // Import axios for HTTP requests
import "./App.css";

const App = () => {
  const [Values, setValues] = useState({
    name: "",
    email: "",
    address: "",
    state: "",
    city: "",
    age: "",
    gender: "",
    mobileNumber: "",
    message: "",
    termsAccepted: false,
    selectedOption: "",
    selectedHobbies: [],
  });

  const [forms, setForms] = useState([]); // State to store all forms fetched from the backend
  const [editMode, setEditMode] = useState(false); // For editing mode
  const [editingFormId, setEditingFormId] = useState(null); // To store the ID of the form being edited
  const [showForms, setShowForms] = useState(false); // State to toggle between form and forms list
  const [formErrors, setFormErrors] = useState({}); // To store form validation errors

  useEffect(() => {
    if (showForms) {
      fetchForms();
    }
  }, [showForms]);

  const fetchForms = async () => {
    try {
      const response = await axios.get("http://localhost:5001/forms");
      setForms(response.data);
    } catch (error) {
      console.log("Error fetching forms:", error);
    }
  };

  const change = (e) => {
    const { name, value, type, checked, options } = e.target;
    if (type === "checkbox") {
      setValues({ ...Values, [name]: checked });
    } else if (type === "select-multiple") {
      const selectedValues = Array.from(options)
        .filter((option) => option.selected)
        .map((option) => option.value);
      setValues({ ...Values, [name]: selectedValues });
    } else {
      setValues({ ...Values, [name]: value });
    }
  };

  const validateForm = () => {
    let errors = {};

    // Name
    if (!Values.name) errors.name = "Name is required";

    // Email
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!Values.email) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(Values.email)) {
      errors.email = "Email is not valid";
    }

    // Address
    if (!Values.address) errors.address = "Address is required";

    // State
    if (!Values.state) errors.state = "State is required";

    // City
    if (!Values.city) errors.city = "City is required";

    // Age
    if (!Values.age) {
      errors.age = "Age is required";
    } else if (isNaN(Values.age)) {
      errors.age = "Age must be a number";
    }

    // Mobile Number
    const phoneRegex = /^[0-9]{10}$/;
    if (!Values.mobileNumber) {
      errors.mobileNumber = "Mobile number is required";
    } else if (!phoneRegex.test(Values.mobileNumber)) {
      errors.mobileNumber = "Mobile number is not valid";
    }

    // Gender
    if (!Values.gender) errors.gender = "Gender is required";

    // Terms and Conditions
    if (!Values.termsAccepted) errors.termsAccepted = "You must accept the terms and conditions";

    // Message
    if (!Values.message) errors.message = "Message is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0; // If no errors, return true
  };

  const submit = async (e) => {
    e.preventDefault(); // Prevent the default form submission

    // Validate the form
    if (validateForm()) {
      try {
        // If editing, update the existing form, otherwise create a new form
        if (editMode) {
          const response = await axios.put(
            `http://localhost:5001/update-form/${editingFormId}`,
            Values
          );
          alert(response.data.message);
        } else {
          const response = await axios.post("http://localhost:5001/submit-form", Values);
          alert(response.data.message); // Show success message
        }
        resetForm();
        setShowForms(false); // Hide forms list after submitting
      } catch (error) {
        console.log(error);
        alert("Error submitting form");
      }
    }
  };

  const resetForm = () => {
    setValues({
      name: "",
      email: "",
      address: "",
      state: "",
      city: "",
      age: "",
      gender: "",
      mobileNumber: "",
      message: "",
      termsAccepted: false,
      selectedOption: "",
      selectedHobbies: [],
    });
    setEditMode(false); // Reset edit mode after submit
    setEditingFormId(null); // Reset the form ID
    setFormErrors({}); // Clear validation errors
  };

  const editForm = (formId) => {
    const form = forms.find((f) => f._id === formId);
    if (form) {
      setValues({
        name: form.name,
        email: form.email,
        address: form.address,
        state: form.state,
        city: form.city,
        age: form.age,
        gender: form.gender,
        mobileNumber: form.mobileNumber,
        message: form.message,
        selectedOption: form.selectedOption,
        selectedHobbies: form.selectedHobbies,
        termsAccepted: form.termsAccepted,
      });
      setEditMode(true);
      setEditingFormId(formId);
      setShowForms(false); // Hide forms list when editing
    }
  };

  const deleteForm = async (formId) => {
    try {
      const response = await axios.delete(`http://localhost:5001/delete-form/${formId}`);
      alert(response.data.message);
      fetchForms(); // Refresh the forms after deletion
    } catch (error) {
      console.log("Error deleting form:", error);
      alert("Error deleting form");
    }
  };

  const toggleFormsView = () => {
    setShowForms(!showForms); // Toggle between forms list and registration form
  };

  return (
    <div className="main">
      {/* Navigation Bar */}
      <div className="navbar">
        <button onClick={toggleFormsView}>
          {showForms ? "Go to Registration Form" : "View Submitted Forms"}
        </button>
      </div>

      <div className="form-container">
        {showForms ? (
          // Displaying the list of submitted forms
          <div>
            <h2>Submitted Forms</h2>
            <ul>
              {forms.map((form) => (
                <li key={form._id}>
                  <p>Name: {form.name}</p>
                  <p>Email: {form.email}</p>
                  <p>Address: {form.address}</p>
                  <button onClick={() => editForm(form._id)}>Edit</button>
                  <button onClick={() => deleteForm(form._id)}>Delete</button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          // Registration form
          <div>
            <h1>{editMode ? "Edit Form" : "Contact Form"}</h1>
            <form className="form" onSubmit={submit}>
              <div className="form-group">
                <label htmlFor="name">Enter your name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={Values.name}
                  onChange={change}
                  placeholder="Your Name"
                />
                {formErrors.name && <p className="error">{formErrors.name}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Enter your email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={Values.email}
                  onChange={change}
                  placeholder="Your Email"
                />
                {formErrors.email && <p className="error">{formErrors.email}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="mobileNumber">Enter your phone number</label>
                <input
                  type="text"
                  id="mobileNumber"
                  name="mobileNumber"
                  value={Values.mobileNumber}
                  onChange={change}
                  placeholder="Phone Number"
                />
                {formErrors.mobileNumber && <p className="error">{formErrors.mobileNumber}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="address">Enter your address</label>
                <textarea
                  id="address"
                  name="address"
                  value={Values.address}
                  onChange={change}
                  placeholder="Address"
                />
                {formErrors.address && <p className="error">{formErrors.address}</p>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="state">State</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={Values.state}
                    onChange={change}
                    placeholder="State"
                  />
                  {formErrors.state && <p className="error">{formErrors.state}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={Values.city}
                    onChange={change}
                    placeholder="City"
                  />
                  {formErrors.city && <p className="error">{formErrors.city}</p>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="age">Age</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={Values.age}
                  onChange={change}
                  placeholder="Age"
                />
                {formErrors.age && <p className="error">{formErrors.age}</p>}
              </div>

              <div className="form-group gender-options">
                <label>Gender</label>
                <div className="radio-buttons">
                  <label className="radio-label">
                    <input
                      type="radio"
                      id="male"
                      name="gender"
                      value="male"
                      checked={Values.gender === "male"}
                      onChange={change}
                    />
                    Male
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      id="female"
                      name="gender"
                      value="female"
                      checked={Values.gender === "female"}
                      onChange={change}
                    />
                    Female
                  </label>
                </div>
                {formErrors.gender && <p className="error">{formErrors.gender}</p>}
              </div>

              <div className="form-group terms-group">
                <label htmlFor="termsAccepted" className="terms-label">
                  <input
                    type="checkbox"
                    id="termsAccepted"
                    name="termsAccepted"
                    checked={Values.termsAccepted}
                    onChange={change}
                    className="terms-checkbox"
                  />
                  I accept the terms and conditions
                </label>
                {formErrors.termsAccepted && <p className="error">{formErrors.termsAccepted}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="selectedOption">Preferred Contact Method</label>
                <select
                  id="selectedOption"
                  name="selectedOption"
                  value={Values.selectedOption}
                  onChange={change}
                >
                  <option value="">Select an option</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="selectedHobbies">Select your hobbies</label>
                <select
                  id="selectedHobbies"
                  name="selectedHobbies"
                  multiple
                  value={Values.selectedHobbies}
                  onChange={change}
                >
                  <option value="reading">Reading</option>
                  <option value="travelling">Travelling</option>
                  <option value="sports">Sports</option>
                  <option value="coding">Coding</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={Values.message}
                  onChange={change}
                  placeholder="Your message"
                />
                {formErrors.message && <p className="error">{formErrors.message}</p>}
              </div>

              <button className="submit-btn" type="submit">
                {editMode ? "Update" : "Submit"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
