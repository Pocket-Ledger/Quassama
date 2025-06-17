import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  Timestamp,
  doc,
  deleteDoc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { app, db } from "../../firebase";
import Group from "models/group/group";

class Invitation {
    user_id;
    group_id;
    status; // 'pending', 'accepted', 'declined'
    created_at;
    member_id;

    constructor(user_id, group_id, group_name, status = 'pending', member_id) {
        this.user_id = user_id;
        this.group_id = group_id;
        this.group_name = group_name; // Assuming group_name is set later or fetched from the group
        this.status = status;
        this.created_at = new Date();
        this.member_id = member_id;
    }
    validate() {
        if (!this.user_id || !this.group_id || !this.member_id) {
            throw new Error("All fields (user_id, group_id, member_id) are required");
        }
        return true;
    }

    async createNew(member_ids) {
    // member_ids can be a single ID or an array
    const auth = getAuth(app);
    const currentUser = auth.currentUser;
    if (!currentUser) {
        throw new Error("No authenticated user found");
    }

    // Normalize to array
    const members = Array.isArray(member_ids) ? member_ids : [member_ids];
    const invitationsCollection = collection(db, "invitations");
    const createdIds = [];

    for (const member_id of members) {
        this.member_id = member_id;
        this.validate();

        const invitationData = {
            user_id: this.user_id,
            group_id: this.group_id,
            group_name: this.group_name,
            status: this.status,
            created_at: Timestamp.fromDate(this.created_at),
            member_id: this.member_id
        };

        const docRef = await addDoc(invitationsCollection, invitationData);
        createdIds.push(docRef.id);
    }

    return createdIds; // returns an array of created invitation IDs
}

    static async getInvitationsByUser(user_id) {
        const invitationsCollection = collection(db, "invitations");
        const q = query(
        invitationsCollection,
        where("member_id", "==", user_id),
        where("status", "==", "pending")
        );
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

    /** 
   * Marks this invitation as accepted *and* adds the user to the group. 
   */
  static async accept(invitationId) {
    const invRef = doc(db, "invitations", invitationId);

    // 1) Mark the invitation accepted
    await updateDoc(invRef, { status: "accepted" });

    // 2) Read back the invitation so we know group_id + member_id
    const snap = await getDoc(invRef);
    if (!snap.exists()) {
      throw new Error("Invitation not found");
    }
    const { group_id, member_id } = snap.data();

    // 3) Add the member to the group’s members array
    await Group.addMemberToGroup(group_id, member_id);
  }

  /** mark this invitation as declined (or just delete it) */
  static async decline(invitationId) {
    // either update a `status: "declined"`…
    const ref = doc(db, "invitations", invitationId);
    await updateDoc(ref, { status: "declined" });
    // …or delete it altogether:
    // await deleteDoc(ref);
  }



}

export default Invitation;