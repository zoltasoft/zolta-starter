<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Domain\Enums;

enum TaskStatus: string
{
    case Todo = 'todo';
    case InProgress = 'in_progress';
    case Done = 'done';

    public function isDone(): bool
    {
        return $this === self::Done;
    }
}
