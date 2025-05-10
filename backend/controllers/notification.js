import { ObjectId } from "mongodb";
import Notification from "../models/notification.js";
import { notificationsNamespace } from "../websockets/index.js";
import usersController from "./users.js";

export async function sendNotification(userId, uid, chatId, data) {
  const user =
    usersController.getUserById(userId) || usersController.getUserByUID(uid);

  if (!user) {
    console.error("Error while sneding notification: User not found");
    return { success: false, status: 404, error: "User not found" };
  }

  const inputObj = {
    userId,
    uid,
    chatId,
    type: data.type,
    title: `A new message from ${data.senderName}`,
    body: data.body,
  };

  const result = await Notification.create(inputObj);
  if (!result) {
    console.error("Could not update notification in DB");
    return {
      success: false,
      status: 500,
      error: "Error Occured When Adding Notification Data Into DB",
    };
  }
  notificationsNamespace.to(uid).emit("notification", {
    ...inputObj,
    _id: result._id,
    createdAt: result.createdAt,
  });

  return result;
}

export async function getNotificationByUserId(userId) {
  try {
    if (!userId) {
      console.error(
        "Error Occurred While Fetching Notification By UserId: Invalid User Id Passed"
      );
      return { success: false, error: "Invalid Input Passed", status: 400 };
    }

    const user = await usersController.getUserById(userId);
    if (!user) {
      console.error(
        "Error Occurred While Fetching Notification By UserId: User not found"
      );
      return { success: false, error: "User Not Found!", status: 404 };
    }
    const userNotifications = await Notification.find({
      userId,
      read: false,
    })
      .sort({ createdAt: -1 })
      .limit(10);
    return { success: true, status: 200, data: userNotifications };
  } catch (e) {
    console.log("Error Occurred While Fetching Notification By UserId:", e);
    return {
      success: false,
      error: `Internal Server Error: ${e}`,
      status: 500,
    };
  }
}

export async function getNotificationByUserUID(uid) {
  try {
    if (!uid) {
      console.error(
        "Error Occurred While Fetching Notification By UID: Invalid UID Passed"
      );
      return { success: false, error: "Invalid Input Passed", status: 400 };
    }

    const user = await usersController.getUserByUID(uid);
    if (!user) {
      console.error(
        "Error Occurred While Fetching Notification By UID: User not found"
      );
      return { success: false, error: "User Not Found!", status: 404 };
    }
    const userNotifications = await Notification.find({
      uid,
      read: false,
    })
      .sort({ createdAt: -1 })
      .limit(10);
    return { success: true, status: 200, data: userNotifications };
  } catch (e) {
    console.log("Error Occurred While Fetching Notification By UserId:", e);
    return {
      success: false,
      error: `Internal Server Error: ${e}`,
      status: 500,
    };
  }
}

export async function markAsRead(uid, nid) {
  try {
    console.log(uid, typeof nid);
    if (!uid || !nid) {
      console.error(
        "Error Occurred in Mark As Read: Invalid UID or notification Id"
      );
      return { success: false, status: 400, error: "Invalid Input Passed" };
    }
    const user = await usersController.getUserByUID(uid);
    if (!user) {
      console.error("Error Occurred in Mark As Read: User not found!");
      return { success: false, status: 404, error: "User Not Found!" };
    }
    const response = await Notification.findByIdAndUpdate(
      { _id: nid },
      { read: true },
      { new: true }
    );
    if (!response) {
      console.error("Error Occurred in Mark As Read: Notification not found");
      return { success: false, status: 404, error: "Notification not found" };
    }
    return { success: true, status: 200, data: response };
  } catch (e) {
    console.log("Error Occurred in Mark As Read: Internal Server Error:", e);
    return {
      success: false,
      error: `Internal Server Error: ${e}`,
      status: 500,
    };
  }
}
