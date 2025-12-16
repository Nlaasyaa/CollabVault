const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function createPost(postData, token) {
  const res = await fetch(`${API_URL}/posts/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(postData)
  });

  if (!res.ok) {
    const error = await res.json();
    console.error("POST ERROR:", error);
    throw new Error(error.message || "Failed to create post");
  }

  return await res.json();
}

export async function getPosts(token = null) {
  const headers = {
    "Content-Type": "application/json"
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}/posts`, {
    method: "GET",
    headers
  });

  if (!res.ok) {
    const error = await res.json();
    console.error("GET POSTS ERROR:", error);
    throw new Error(error.message || "Failed to fetch posts");
  }

  return await res.json();
}

export async function getPost(postId, token = null) {
  const headers = {
    "Content-Type": "application/json"
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}/posts/${postId}`, {
    method: "GET",
    headers
  });

  if (!res.ok) {
    const error = await res.json();
    console.error("GET POST ERROR:", error);
    throw new Error(error.message || "Failed to fetch post");
  }

  return await res.json();
}

export async function getAllProfiles() {
  const res = await fetch(`${API_URL}/profile`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  });

  if (!res.ok) {
    const error = await res.json();
    console.error("GET PROFILES ERROR:", error);
    throw new Error(error.message || "Failed to fetch profiles");
  }

  return await res.json();
}


export async function likePost(postId, token) {
  const res = await fetch(`${API_URL}/posts/${postId}/like`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error("Failed to like post");
  }

  return await res.json();
}

export async function commentPost(postId, content, token) {
  const res = await fetch(`${API_URL}/posts/${postId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ content })
  });

  if (!res.ok) {
    throw new Error("Failed to comment on post");
  }

  return await res.json();
}

export async function getComments(postId) {
  const res = await fetch(`${API_URL}/posts/${postId}/comments`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  });

  if (!res.ok) {
    throw new Error("Failed to fetch comments");
  }

  return await res.json();
}

export async function sendMessage(receiverId, content, token, file = null) {
  const formData = new FormData();
  formData.append("receiver_id", receiverId);
  if (content) formData.append("content", content);
  if (file) formData.append("file", file);

  const res = await fetch(`${API_URL}/messages/send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  if (!res.ok) {
    const error = await res.json();
    console.error("SEND MESSAGE ERROR:", error);
    throw new Error(error.message || "Failed to send message");
  }

  return await res.json();
}

export async function getMessages(otherUserId, token) {
  const res = await fetch(`${API_URL}/messages/history/${otherUserId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const error = await res.json();
    console.error("GET MESSAGES ERROR:", error);
    throw new Error(error.message || "Failed to fetch messages");
  }

  return await res.json();
}

export async function createConnection(targetUserId, token) {
  const res = await fetch(`${API_URL}/connections/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ target_user_id: targetUserId })
  });

  if (!res.ok) {
    const error = await res.json();
    console.error("CREATE CONNECTION ERROR:", error);
    throw new Error(error.message || "Failed to create connection");
  }

  return await res.json();
}

export async function getMyConnections(token) {
  const res = await fetch(`${API_URL}/connections`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const error = await res.json();
    console.error("GET CONNECTIONS ERROR:", error);
    throw new Error(error.message || "Failed to fetch connections");
  }

  return await res.json();
}

export async function checkConnection(targetUserId, token) {
  const res = await fetch(`${API_URL}/connections/check/${targetUserId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const error = await res.json();
    console.error("CHECK CONNECTION ERROR:", error);
    throw new Error(error.message || "Failed to check connection");
  }

  return await res.json();
}

export async function createTeamGroup(name, members, token) {
  const res = await fetch(`${API_URL}/team-groups/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ name, members })
  });

  if (!res.ok) {
    const error = await res.json();
    console.error("CREATE TEAM GROUP ERROR:", error);
    throw new Error(error.message || "Failed to create team group");
  }

  return await res.json();
}

export async function getMyTeamGroups(token) {
  const res = await fetch(`${API_URL}/team-groups`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const error = await res.json();
    console.error("GET TEAM GROUPS ERROR:", error);
    throw new Error(error.message || "Failed to fetch team groups");
  }

  return await res.json();
}

export async function sendTeamMessage(groupId, content, token, file = null) {
  const formData = new FormData();
  if (content) formData.append("content", content);
  if (file) formData.append("file", file);

  const res = await fetch(`${API_URL}/team-groups/${groupId}/messages/send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  if (!res.ok) {
    const error = await res.json();
    console.error("SEND TEAM MESSAGE ERROR:", error);
    throw new Error(error.message || "Failed to send team message");
  }

  return await res.json();
}

export async function getTeamMessages(groupId, token) {
  const res = await fetch(`${API_URL}/team-groups/${groupId}/messages`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const error = await res.json();
    console.error("GET TEAM MESSAGES ERROR:", error);
    throw new Error(error.message || "Failed to fetch team messages");
  }

  return await res.json();
}

export async function deleteTeamGroup(groupId, token) {
  const res = await fetch(`${API_URL}/team-groups/${groupId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const error = await res.json();
    console.error("DELETE TEAM GROUP ERROR:", error);
    throw new Error(error.message || "Failed to delete team group");
  }

  return await res.json();
}

export async function addMemberToGroup(groupId, userId, token) {
  const res = await fetch(`${API_URL}/team-groups/${groupId}/members/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ userId })
  });

  if (!res.ok) {
    const error = await res.json();
    console.error("ADD MEMBER TO GROUP ERROR:", error);
    throw new Error(error.message || "Failed to add member to group");
  }

  return await res.json();
}

export async function removeMemberFromGroup(groupId, userId, token) {
  const res = await fetch(`${API_URL}/team-groups/${groupId}/members/${userId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const error = await res.json();
    console.error("REMOVE MEMBER FROM GROUP ERROR:", error);
    throw new Error(error.message || "Failed to remove member from group");
  }

  return await res.json();
}

export async function blockUser(targetUserId, token) {
  const res = await fetch(`${API_URL}/blocked/block`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ target_user_id: targetUserId })
  });

  if (!res.ok) {
    const error = await res.json();
    console.error("BLOCK USER ERROR:", error);
    throw new Error(error.message || "Failed to block user");
  }

  return await res.json();
}

export async function unblockUser(targetUserId, token) {
  const res = await fetch(`${API_URL}/blocked/unblock`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ target_user_id: targetUserId })
  });

  if (!res.ok) {
    const error = await res.json();
    console.error("UNBLOCK USER ERROR:", error);
    throw new Error(error.message || "Failed to unblock user");
  }

  return await res.json();
}

export async function checkBlocked(targetUserId, token) {
  const res = await fetch(`${API_URL}/blocked/check/${targetUserId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const error = await res.json();
    console.error("CHECK BLOCKED ERROR:", error);
    throw new Error(error.message || "Failed to check block status");
  }

  return await res.json();
}

export async function getRecommendations(token) {
  const res = await fetch(`${API_URL}/recommendations`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const error = await res.json();
    console.error("GET RECOMMENDATIONS ERROR:", error);
    throw new Error(error.message || "Failed to fetch recommendations");
  }

  return await res.json();
}

export async function getAllSkills() {
  const res = await fetch(`${API_URL}/skills`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  });

  if (!res.ok) {
    const error = await res.json();
    console.error("GET SKILLS ERROR:", error);
    throw new Error(error.message || "Failed to fetch skills");
  }

  return await res.json();
}

export async function getAllInterests() {
  const res = await fetch(`${API_URL}/interests`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  });

  if (!res.ok) {
    const error = await res.json();
    console.error("GET INTERESTS ERROR:", error);
    throw new Error(error.message || "Failed to fetch interests");
  }

  return await res.json();
}

export async function markMessagesRead(otherUserId, token) {
  const res = await fetch(`${API_URL}/messages/mark-read/${otherUserId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error("Failed to mark messages read");
  return await res.json();
}

export async function markGroupRead(groupId, token) {
  const res = await fetch(`${API_URL}/team-groups/${groupId}/mark-read`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error("Failed to mark group read");
  return await res.json();
}

export async function leaveTeamGroup(groupId, newAdminId, token) {
  const res = await fetch(`${API_URL}/team-groups/${groupId}/leave`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ new_admin_id: newAdminId })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to leave group");
  }
  return await res.json();
}

export async function submitFeedback(feedbackData, token) {
  const headers = {
    "Content-Type": "application/json"
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}/feedback`, {
    method: "POST",
    headers,
    body: JSON.stringify(feedbackData)
  });

  if (!res.ok) {
    const error = await res.json();
    console.error("SUBMIT FEEDBACK ERROR:", error);
    throw new Error(error.message || "Failed to submit feedback");
  }

  return await res.json();
}

export async function getAdminUsers(token) {
  const res = await fetch(`${API_URL}/admin/users`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }

  return await res.json();
}

export async function blockUserAdmin(userId, token) {
  const res = await fetch(`${API_URL}/admin/users/${userId}/block`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error("Failed to block user");
  }

  return await res.json();
}

export async function unblockUserAdmin(userId, token) {
  const res = await fetch(`${API_URL}/admin/users/${userId}/unblock`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error("Failed to unblock user");
  }

  return await res.json();
}

export async function getAdminFeedback(token) {
  const res = await fetch(`${API_URL}/admin/feedback`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error("Failed to fetch feedback");
  }

  return await res.json();
}

export async function addAllowedDomain(domain, displayName, token) {
  const res = await fetch(`${API_URL}/admin/allowed-domains`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ domain, display_name: displayName })
  });

  if (!res.ok) {
    throw new Error("Failed to add domain");
  }

  return await res.json();
}

export async function getAllowedDomains(token) {
  const res = await fetch(`${API_URL}/admin/allowed-domains`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error("Failed to fetch allowed domains");
  }

  return await res.json();
}

export async function removeAllowedDomain(id, token) {
  const res = await fetch(`${API_URL}/admin/allowed-domains/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error("Failed to remove domain");
  }

  return await res.json();
}

export async function verifyUserAdmin(userId, isVerify, token) {
  const action = isVerify ? "verify" : "unverify";
  const res = await fetch(`${API_URL}/admin/users/${userId}/${action}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) throw new Error(`Failed to ${action} user`);
  return await res.json();
}

export async function deleteUserAdmin(userId, token) {
  const res = await fetch(`${API_URL}/admin/users/${userId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) throw new Error("Failed to delete user");
  return await res.json();
}

export async function replyToFeedback(feedbackId, reply, token) {
  const res = await fetch(`${API_URL}/admin/feedback/${feedbackId}/reply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ reply })
  });

  if (!res.ok) throw new Error("Failed to send reply");
  return await res.json();
}

export async function getMyFeedbackHistory(token) {
  const res = await fetch(`${API_URL}/feedback/history`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) throw new Error("Failed to fetch feedback history");
  return await res.json();
}

export async function deletePostAdmin(postId, token) {
  const res = await fetch(`${API_URL}/admin/posts/${postId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error("Failed to delete post");
  return await res.json();
}

export async function deleteCommentAdmin(commentId, token) {
  const res = await fetch(`${API_URL}/admin/comments/${commentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error("Failed to delete comment");
  return await res.json();
}

export async function getAdminAnalytics(token) {
  const res = await fetch(`${API_URL}/admin/analytics`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return await res.json();
}

export async function getAnnouncements(token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`${API_URL}/announcements`, { headers });
  if (!res.ok) throw new Error("Failed to fetch announcements");
  return await res.json();
}

export async function createAnnouncement(data, token) {
  const res = await fetch(`${API_URL}/admin/announcements`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to create announcement");
  return await res.json();
}

export async function deleteAnnouncement(id, token) {
  const res = await fetch(`${API_URL}/admin/announcements/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to delete announcement");
  return await res.json();
}

export async function getProfileById(id) {
  const res = await fetch(`${API_URL}/profile/${id}`);
  if (!res.ok) throw new Error("Failed to fetch user profile");
  return await res.json();
}

export async function getPendingRequests(token) {
  const res = await fetch(`${API_URL}/connections/requests`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error("Failed to fetch requests");
  return await res.json();
}

export async function acceptRequest(targetUserId, token) {
  const res = await fetch(`${API_URL}/connections/accept`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ target_user_id: targetUserId })
  });
  if (!res.ok) throw new Error("Failed to accept request");
  return await res.json();
}

export async function rejectRequest(targetUserId, token) {
  const res = await fetch(`${API_URL}/connections/reject`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ target_user_id: targetUserId })
  });
  if (!res.ok) throw new Error("Failed to reject request");
  return await res.json();
}

export async function removeConnection(targetUserId, token) {
  const res = await fetch(`${API_URL}/connections/${targetUserId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error("Failed to remove connection");
  return await res.json();
}

export async function getBrowseProfiles(token) {
  const res = await fetch(`${API_URL}/profile/browse`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const error = await res.json();
    console.error("GET BROWSE PROFILES ERROR:", error);
    throw new Error(error.message || "Failed to fetch profiles");
  }

  return await res.json();
}

export async function forgotPassword(email) {
  const res = await fetch("http://localhost:5000/auth/forgot-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email })
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to request password reset");
  }

  return await res.json();
}

export async function resetPassword(email, token, newPassword) {
  const res = await fetch("http://localhost:5000/auth/reset-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, token, newPassword })
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to reset password");
  }

  return await res.json();
}
