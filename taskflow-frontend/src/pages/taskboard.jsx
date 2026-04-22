import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api, { getProjectTasks } from '../services/api';

const TaskBoard = () => {
    const { projectId } = useParams();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const data = await getProjectTasks(projectId);
            setTasks(Array.isArray(data) ? data : []);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching tasks:", error);
            setTasks([]);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [projectId]);

    const moveTask = async (taskId, newStatus) => {
        // 1. خريطة التحويل (Mapping) من النص للرقم
        // اتأكدي إن الأرقام دي هي نفس ترتيب الـ Enum في ملف TaskStatus.cs
        const statusMap = {
            "ToDo": 0,
            "InProgress": 1,
            "Done": 2
        };

        try {
            // 2. حولنا الحالة لرقم قبل ما نبعتها
            const numericStatus = statusMap[newStatus];

            // 3. بنبعت الرقم بدل النص
            await api.patch(`/tasks/${taskId}/status`, { status: numericStatus });

            fetchTasks(); // تحديث البورد بعد النجاح
        } catch (error) {
            console.error("خطأ أثناء التحديث:", error.response?.data);
            alert("Failed to update task status");
        }
    };

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'Low': return 'bg-success';    // Green
            case 'Medium': return 'bg-warning text-dark'; // Amber (Yellow) - text-dark للأوضح
            case 'High': return 'bg-danger';    // Red
            default: return 'bg-secondary';
        }
    };

    const todoTasks = tasks.filter(t => t.status === 'ToDo');
    const inProgressTasks = tasks.filter(t => t.status === 'InProgress');
    const doneTasks = tasks.filter(t => t.status === 'Done');

    const renderColumn = (title, taskList, nextStatus) => (
        <div className="col-md-4">
            <h4 className="text-center bg-light p-2 rounded">{title}</h4>
            <div className="border p-2" style={{ minHeight: '500px' }}>
                {taskList.map(task => (
                    <div key={task.id} className="card mb-3 shadow-sm">
                        <div className="card-body">
                            {/* 1. Title */}
                            <h6 className="card-title text-primary text-center">{task.title}</h6>

                            {/* 2. Priority Badge */}
                            <div className="text-center mb-2">
                                <span className={`badge ${getPriorityBadge(task.priority)}`}>
                                    {task.priority}
                                    {/* لو حابب تضيف آيكونا للبريتي */}
                                    {task.priority === 'High' && <span className='ms-1'>⚠️</span>}
                                </span>
                            </div>

                            {/* التعديل هنا: إضافة البيانات الناقصة المطلوبة */}
                            {/* 3. Assigned member name */}
                            <p className="card-text small mb-1">
                                <span className='fw-bold text-muted'>Assigned To: </span>
                                {task.assignedUserName || 'Unassigned'} {/* لو مفيش اسم، نقول 'غير موكل' */}
                            </p>

                            {/* 4. Due date */}
                            <p className="card-text small mb-3">
                                <span className='fw-bold text-muted'>Due Date: </span>
                                {/* لو التاريخ موجود، نعرضه بتنسيق حلو */}
                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                            </p>

                            {/* 5. Add "Move" button with next status */}
                            {nextStatus && (
                                <button
                                    className="btn btn-outline-primary btn-sm w-100"
                                    onClick={() => moveTask(task.id, nextStatus)}
                                >
                                    Move to {nextStatus}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    if (loading) return <div className="text-center mt-5"><h4>Loading Board...</h4></div>;

    return (
        <div className="container-fluid mt-4">
            <h2 className="mb-4 text-center">Project {projectId} Task Board</h2>
            <div className="row">
                {renderColumn("To Do", todoTasks, "InProgress")}
                {renderColumn("In Progress", inProgressTasks, "Done")}
                {renderColumn("Done", doneTasks, null)} {/* آخر عمود مفيش فيه Move */}
            </div>
        </div>
    );
};

export default TaskBoard;