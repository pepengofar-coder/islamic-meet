import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function AdminUsers() {
    const [users, setUsers] = useState([])

    const getUsers = async () => {
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("verification_status", "pending")

        if (!error) setUsers(data)
    }

    useEffect(() => {
        getUsers()
    }, [])

    const approveUser = async (id) => {
        await supabase
            .from("profiles")
            .update({ verification_status: "approved" })
            .eq("id", id)

        alert("User approved")
        getUsers()
    }

    const rejectUser = async (id) => {
        await supabase
            .from("profiles")
            .update({ verification_status: "rejected" })
            .eq("id", id)

        alert("User rejected")
        getUsers()
    }

    return (
        <div style={{ padding: 20 }}>
            <h2>Admin - Verifikasi User</h2>

            {users.map((user) => (
                <div key={user.id} style={{ border: "1px solid #ccc", marginBottom: 20, padding: 10 }}>
                    <p><b>{user.name}</b></p>

                    <img src={user.ktp_url} width={150} alt="ktp" />
                    <img src={user.selfie_url} width={150} alt="selfie" />

                    <br /><br />

                    <button onClick={() => approveUser(user.id)}>Approve</button>
                    <button onClick={() => rejectUser(user.id)}>Reject</button>
                </div>
            ))}
        </div>
    )
}