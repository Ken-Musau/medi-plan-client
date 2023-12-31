import moment from "moment";
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import { baseUrl } from "../utlis";
import "./appointment.css";

function Appointments({ onSetLoggedUser }) {
  //const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  function handleLogoutClick() {
    fetch(`${baseUrl}/logout`, { method: "DELETE" }).then((r) => {
      if (r.ok) {
        onSetLoggedUser(null);
        navigate("/login");
      }
    });
  }
  // const navigate = useNavigate();
  console.log(user.id);
  // var user = state.loggedInUser;
  const [appointments, setAppointments] = useState(user.appointments);
  const [formData, setFormData] = useState({
    date: "",
    description: "",
  });
  const [editingAppointment, setEditingAppointment] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const handleCreateAppointment = (e) => {
    e.preventDefault();
    const newAppointment = {
      date_time: formData.date,
      description: formData.description,
      doctor_id: 19,
      patient_id: user.id,
    };
    console.log("Sending data:", JSON.stringify(newAppointment));
    fetch(`${baseUrl}/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAppointment),
    })
      .then((response) => response.json())
      .then((data) => {
        setAppointments((prevAppointments) => [...prevAppointments, data]);
        setFormData({
          date: "",
          description: "",
        });
      })
      .catch((error) => console.error("Error creating appointment:", error));
  };

  const handleEditAppointment = (appointmentId) => {
    const appointmentToEdit = appointments.find(
      (appointment) => appointment.id === appointmentId
    );

    if (appointmentToEdit) {
      setEditingAppointment(appointmentToEdit);
      setFormData({
        date: appointmentToEdit.date_time,
        description: appointmentToEdit.description,
      });
    }
  };

  const handleUpdateAppointment = (e) => {
    e.preventDefault();
    if (editingAppointment) {
      const updatedAppointmentData = {
        date_time: formData.date,
        description: formData.description,
      };

      fetch(`${baseUrl}/appointments/${editingAppointment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedAppointmentData),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("This is the response data");
          console.log(data);
          const updatedAppointments = appointments.map((appointment) =>
            appointment.id === data.id ? data : appointment
          );
          console.log(updatedAppointments);
          setAppointments(updatedAppointments);
          setFormData({
            date: "",
            description: "",
          });
          setEditingAppointment(null);
          user.Appointments = updatedAppointments;
          navigate("/appointments", { state: { loggedInUser: user } });
        })
        .catch((error) => {
          console.error("Error updating appointment:", error);
        });
    }
  };

  const handleDeleteAppointment = (appointmentId) => {
    fetch(`${baseUrl}/appointments/${appointmentId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          const updatedAppointments = appointments.filter(
            (appointment) => appointment.id !== appointmentId
          );
          setAppointments(updatedAppointments);
        } else {
          console.error("Error deleting appointment");
        }
      })
      .catch((error) => {
        console.error("Error deleting appointment:", error);
      });
  };

  return (
    <div className="appointment_app">
      <h1 className="appointment_name_header">Welcome {user.username}</h1>
      <div className="appointment_header">
        <h1>Appointments</h1>
        <button
          className="appointment_btn btn_logout"
          onClick={handleLogoutClick}
        >
          Log Out
        </button>
      </div>
      <p>Name: {user.full_name}</p>
      <p>Date of Birth: {moment(user.dob).format("MMMM Do YYYY")}</p>
      <h2>Appointments</h2>
      {appointments.map((appointment) => (
        <div key={appointment.id} className="appointment_list">
          <p>
            Date:{" "}
            {moment(appointment.date_time).format("MMMM Do YYYY, h:mm:ss a")}
          </p>
          <p>Description: {appointment.description}</p>
          <button
            className="appointment_btn btn_edit"
            onClick={() => handleEditAppointment(appointment.id)}
          >
            Edit
          </button>
          <button
            className="appointment_btn btn_logout"
            onClick={() => handleDeleteAppointment(appointment.id)}
          >
            Delete
          </button>
        </div>
      ))}
      <h2>{editingAppointment ? "Edit Appointment" : "Create Appointment"}</h2>
      <form
        onSubmit={
          editingAppointment ? handleUpdateAppointment : handleCreateAppointment
        }
      >
        <div>
          <label>Date:</label>
          <input
            type="datetime-local"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label>Description:</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
          />
        </div>
        <button className="appointment_btn btn_update" type="submit">
          {editingAppointment ? "Update" : "Create"}
        </button>
        {editingAppointment && (
          <button
            className="appointment_btn btn_cancel"
            onClick={() => setEditingAppointment(null)}
          >
            Cancel
          </button>
        )}
      </form>
    </div>
  );
}

export default Appointments;
