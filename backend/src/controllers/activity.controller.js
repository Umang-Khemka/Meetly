import httpStatus from "http-status";
import { Meeting } from "../models/meeting.model.js";

const addActivity = async (req, res) => {
    try {
        const { meetingCode } = req.body;

        if (!meetingCode) {
            return res.status(httpStatus.BAD_REQUEST).json({ message: "Meeting code is required" });
        }

        const newMeeting = new Meeting({
            user_id: req.user._id,
            meetingCode
        });

        await newMeeting.save();

        return res.status(httpStatus.CREATED).json({ message: "Activity added successfully", meeting: newMeeting });
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: `Something went wrong: ${error.message}` });
    }
};

const getAllActivity = async (req, res) => {
    try {
        const activities = await Meeting.find({ user_id: req.user._id });
        return res.status(httpStatus.OK).json({ activities });
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: `Something went wrong: ${error.message}` });
    }
};

export { addActivity, getAllActivity };
