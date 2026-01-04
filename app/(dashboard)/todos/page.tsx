import { getTodos } from '../../actions/todos';
import TodoList from '../../../components/TodoList';

export default async function TodosPage() {
    const todos = await getTodos();

    return <TodoList initialTodos={todos as any} />;
}
