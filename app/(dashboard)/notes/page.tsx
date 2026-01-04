import { getNotes } from '../../actions/notes';
import NotesGrid from '../../../components/NotesGrid';

export default async function NotesPage() {
    const notes = await getNotes();

    return <NotesGrid initialNotes={notes as any} />;
}
