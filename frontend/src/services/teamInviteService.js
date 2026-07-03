import api from "../api/axios";

/*
|--------------------------------------------------------------------------
| Send Invite
|--------------------------------------------------------------------------
*/

export const sendInvite = async (data) => {
  const response = await api.post(
    "/team-invites",
    data
  );

  return response.data.data;
};

/*
|--------------------------------------------------------------------------
| Sent Invites
|--------------------------------------------------------------------------
*/

export const getSentInvites = async () => {
  const response = await api.get(
    "/team-invites/sent"
  );

  return response.data.data;
};

/*
|--------------------------------------------------------------------------
| Received Invites
|--------------------------------------------------------------------------
*/

export const getReceivedInvites =
  async () => {
    const response = await api.get(
      "/team-invites/received"
    );

    return response.data.data;
  };

/*
|--------------------------------------------------------------------------
| Accept Invite
|--------------------------------------------------------------------------
*/

export const acceptInvite = async (
  inviteId
) => {
  const response =
    await api.patch(
      `/team-invites/${inviteId}/accept`
    );

  return response.data.data;
};

/*
|--------------------------------------------------------------------------
| Reject Invite
|--------------------------------------------------------------------------
*/

export const rejectInvite = async (
  inviteId
) => {
  const response =
    await api.patch(
      `/team-invites/${inviteId}/reject`
    );

  return response.data.data;
};