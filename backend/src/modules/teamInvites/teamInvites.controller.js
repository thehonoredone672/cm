const {
  sendInvite,
  getSentInvites,
  getReceivedInvites,
  acceptInvite,
  rejectInvite,
} = require("./teamInvites.service");

const sendInviteHandler = async (req, res, next) => {
  try {
    const { receiverId, message } = req.body;

    const invite = await sendInvite(
      req.user.id,
      receiverId,
      message
    );

    res.status(201).json({
      success: true,
      message: "Invite sent successfully.",
      data: invite,
    });
  } catch (error) {
    next(error);
  }
};

const getSentInvitesHandler = async (
  req,
  res,
  next
) => {
  try {
    const invites = await getSentInvites(
      req.user.id
    );

    res.status(200).json({
      success: true,
      data: invites,
    });
  } catch (error) {
    next(error);
  }
};

const getReceivedInvitesHandler = async (
  req,
  res,
  next
) => {
  try {
    const invites =
      await getReceivedInvites(req.user.id);

    res.status(200).json({
      success: true,
      data: invites,
    });
  } catch (error) {
    next(error);
  }
};

const acceptInviteHandler = async (
  req,
  res,
  next
) => {
  try {
    const invite = await acceptInvite(
      req.params.id,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: "Invite accepted.",
      data: invite,
    });
  } catch (error) {
    next(error);
  }
};

const rejectInviteHandler = async (
  req,
  res,
  next
) => {
  try {
    const invite = await rejectInvite(
      req.params.id,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: "Invite rejected.",
      data: invite,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendInviteHandler,
  getSentInvitesHandler,
  getReceivedInvitesHandler,
  acceptInviteHandler,
  rejectInviteHandler,
};