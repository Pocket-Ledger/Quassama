class Invitation {
    user_id;
    group_id;
    status; // 'pending', 'accepted', 'declined'
    created_at;
    member_id; // ID of the member who revecved the invitation

    constructor(user_id, group_id, status = 'pending', member_id) {
        this.user_id = user_id;
        this.group_id = group_id;
        this.status = status;
        this.created_at = new Date();
        this.member_id = member_id; // ID of the member who received the invitation
    }
    validate() {
        if (!this.user_id || !this.group_id || !this.member_id) {
            throw new Error("All fields (user_id, group_id, member_id) are required");
        }
        return true;
    }

    async createNew() {
        this.validate();

        const auth = getAuth(app);
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error("No authenticated user found");
        }

        const invitationData = {
            user_id: this.user_id,
            group_id: this.group_id,
            status: this.status,
            created_at: Timestamp.fromDate(this.created_at),
            member_id: this.member_id
        };

        const invitationsCollection = collection(db, "invitations");
        const docRef = await addDoc(invitationsCollection, invitationData);
        return docRef.id;
    }

    static async getInvitationsByUser(user_id) {
        const invitationsCollection = collection(db, "invitations");
        const q = query(invitationsCollection, where("user_id", "==", user_id));
        const querySnapshot = await getDocs(q);
        const invitations = [];
        querySnapshot.forEach((doc) => {
            invitations.push({ id: doc.id, ...doc.data() });
        });
        return invitations;
    }

    //static 

    static async deleteInvitation(invitationId) {
        const invitationRef = doc(db, "invitations", invitationId);
        await deleteDoc(invitationRef);
        return `Invitation ${invitationId} deleted`;
    }



}