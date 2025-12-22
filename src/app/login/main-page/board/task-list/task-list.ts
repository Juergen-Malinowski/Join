import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    CdkDrag,
    CdkDropList,
    CdkDropListGroup,
    CdkDragDrop,
    moveItemInArray,
    transferArrayItem
} from '@angular/cdk/drag-drop';

@Component({
    selector: 'app-task-list',
    imports: [
        CommonModule,
        CdkDrag,
        CdkDropList,
        CdkDropListGroup,
    ],
    templateUrl: './task-list.html',
    styleUrl: './task-list.scss',
})
export class TaskList {

    // =========================
    // UI-DUMMY TASKS 
    // =========================

    todoTasks = [
        {
            type: 'User Story',
            title: 'Kochwelt Page & Recipe Recommender',
            description: 'Build start page with recipe recommendation',
            subtasksDone: 1,
            subtasksTotal: 2,
            priority: 'medium'
        }
    ];

    inProgressTasks = [
        {
            type: 'Technical Task',
            title: 'Implement Auth Guard',
            description: 'Protect board route',
            subtasksDone: 0,
            subtasksTotal: 1,
            priority: 'urgent'
        }
    ];

    awaitFeedbackTasks = [
        {
            type: 'User Story',
            title: 'Feedback Landing Page',
            description: 'Waiting for UX feedback',
            subtasksDone: 0,
            subtasksTotal: 0,
            priority: 'low'
        }
    ];

    doneTasks = [
        {
            type: 'Technical Task',
            title: 'Setup Project Structure',
            description: 'Initial Angular project setup',
            subtasksDone: 3,
            subtasksTotal: 3,
            priority: 'low'
        }
    ];

    // =========================
    // DRAG & DROP LOGIC
    // =========================

    drop(event: CdkDragDrop<any[]>) {
        if (event.previousContainer === event.container) {
            moveItemInArray(
                event.container.data,
                event.previousIndex,
                event.currentIndex
            );
        } else {
            transferArrayItem(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex
            );
        }
    }
}
