import React from "react";

function UserSelector({ users, selectedUserId, onChange }) {
  return (
    <label className="user-selector">
      Active user
      <select value={selectedUserId || ""} onChange={(event) => onChange(event.target.value)}>
        <option value="">All users</option>
        {users.map((user) => <option key={user.id} value={user.id}>{user.name} ({user.role})</option>)}
      </select>
    </label>
  );
}

export default UserSelector;