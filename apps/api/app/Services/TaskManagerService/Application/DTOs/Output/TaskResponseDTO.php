<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Application\DTOs\Output;

use App\Services\TaskManagerService\Application\Projections\TaskView;
use App\Services\TaskManagerService\Domain\Aggregates\Task;
use Zolta\Support\Application\DTO\Output\ResponseDTO;

final class TaskResponseDTO extends ResponseDTO
{
    public function __construct(public readonly string $id, public readonly string $project_id, public readonly string $owner_id, public readonly string $title, public readonly ?string $description, public readonly string $status, public readonly string $priority) {}
    public static function fromDomain(Task $task): self { return new self($task->id()->toString(), $task->projectId()->toString(), $task->ownerId()->toString(), $task->title(), $task->description(), $task->status()->value, $task->priority()->value); }
    public static function fromView(TaskView $view): self { return new self($view->id, $view->projectId, $view->ownerId, $view->title, $view->description, $view->status, $view->priority); }
}
