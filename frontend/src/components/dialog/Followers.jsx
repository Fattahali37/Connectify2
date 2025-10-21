import React, { useEffect, useState } from 'react'
import { url } from '../../baseUrl'
import { api } from '../../Interceptor/apiCall'
import { User } from './User'

export const Followers = ({ userId, toggle, handleClose }) => {
  const [users, setUsers] = useState([])
  console.log(userId);
  useEffect(() => {
    if (!userId) return
    if (toggle === 1)
      api.get(`${url}/user/followers/${userId}`).then((res) => {
        console.log(res.data);
        setUsers(Array.isArray(res.data) ? res.data : [])
      }).catch((err) => {
        console.log(err);
        setUsers([])
      })
    if (toggle === 2)
      api.get(`${url}/user/followings/${userId}`).then((res) => {
        console.log(res.data);
        setUsers(Array.isArray(res.data) ? res.data : [])
      }).catch((err) => {
        console.log(err);
        setUsers([])
      })
  }, [toggle, userId])
  return (
    <div style={{ padding: '0 -17px' }}>
      {
        Array.isArray(users) && users.length === 0 && <p style={{ textAlign: 'center', marginTop: '19px' }}>Nothing to see</p>
      }
      {
        Array.isArray(users) && users.map((item => <User handleClose={handleClose} key={item._id} user={item} />))

      }
    </div>
  )
}
