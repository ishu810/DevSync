// import { getToken } from "firebase/messaging";
// import { messaging } from "./firebase";
// import axios from "axios";

// export const requestPermission = async (userId) => {
//   console.log("Requesting notification permission...");

//   try {
//     const permission = await Notification.requestPermission();

//     if (permission !== "granted") {
//       console.warn("Notification permission denied");
//       return;
//     }

//     const token = await getToken(messaging, {
//       vapidKey: "BG8L7pkVGe7RpMdpDSuJd4IR-_QDh0D6Xllb9UIRgcpoeUBXhqhyRL-V2mkWLzDKMcUT24eha-BujuJm7IA4Ia0",
//     });

//     if (!token) {
//       console.error("Failed to get FCM token from Firebase");
//       return;
//     }

//     console.log("FCM Token:", token);

//     const response = await axios.post("http://localhost:5000/api/v1/save-token", {
//       userId,
//       token,
//     });

//     if (response.data.success) {
//       console.log("Token saved successfully:", response.data.data.fcmToken);
//     } else {
//       console.warn("Failed to save token:", response.data.message);
//     }
//   } catch (err) {
//     console.error("Error in requestPermission:", err);
//   }
// };



import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";
import axios from "axios";

export const requestPermission = async (userId) => {
  console.log("Requesting notification permission...");

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission denied");
      return;
    }

    //REGISTER SERVICE WORKER
    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );
    console.log(permission)
    console.log(registration)
    
    const fcmToken = await getToken(messaging, {
      vapidKey:"BJ-_r57gZZxXsA8-jgDuzZ4uW8dfTWJDlJt5j9v_0m2WkB5SNDpm-X8v5pKeFeGs0XgBQkVfczZNOOKd4eDb7Q0",
      // vapidKey: "BG8L7pkVGe7RpMdpDSuJd4IR-_QDh0D6Xllb9UIRgcpoeUBXhqhyRL-V2mkWLzDKMcUT24eha-BujuJm7IA4Ia0",
      serviceWorkerRegistration: registration,
    });
    console.log(fcmToken)
    console.log("got fcm token")

    if (!fcmToken) {
      console.error("Failed to get FCM token from Firebase");
      return;
    }

    console.log("FCM Token:", fcmToken);

    // Save token to backend
    const response = await axios.post("http://localhost:5000/api/v1/save-token", {
      fcmToken,
      userId,
    });
    console.log("res data",response.data);
    
    console.log("response",response)
    if (response.status===200) {
      console.log("Token saved successfully:", response.data);
    } else {
      console.warn("Failed to save token:", response.data?.message);
    }
  } catch (err) {
    console.error("Error in requestPermission:", err);
  }
};
