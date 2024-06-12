import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App.jsx";
import "./index.css";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { Home } from "./pages/Home.jsx";
import { Patients } from "./pages/Patients.jsx";
import { PatientRecords } from "./pages/PatientRecords.jsx";
import { Procedures } from "./pages/Procedures.jsx";
import { Doctors } from "./pages/Doctors.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Navigate to="/dentistry-clinic-admin/home" />,
      },
      {
        path: "/dentistry-clinic-admin/home",
        element: <Home />,
      },
      {
        path: "/dentistry-clinic-admin/patients",
        element: <Patients />,
      },
      {
        path: "/dentistry-clinic-admin/patient-records/:patientID",
        element: <PatientRecords />,
      },
      {
        path: "/dentistry-clinic-admin/procedures",
        element: <Procedures />,
      },
      {
        path: "/dentistry-clinic-admin/doctors",
        element: <Doctors />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
