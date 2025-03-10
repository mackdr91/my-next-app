"use client";
import React, { useEffect } from 'react'
import { useState } from 'react'

const About = () => {
    const [users, setUsers] = useState([]);
    useEffect(() => {
        fetch('/api/users')
        .then(res => res.json())
        .then(data => setUsers(data.users));

    }, []);
    console.log(users);
    return (
    <div>
        <h1>About</h1>
        <ul>
            {users.map(user => (
                <li key={user.id}>{user.name}</li>
            ))}
        </ul>
    </div>
  )
}

export default About