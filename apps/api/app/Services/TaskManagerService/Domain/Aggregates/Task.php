<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Domain\Aggregates;

use App\Services\TaskManagerService\Domain\Enums\TaskPriority;
use App\Services\TaskManagerService\Domain\Enums\TaskStatus;
use App\Services\TaskManagerService\Domain\Exceptions\InvalidTaskTransition;
use App\Services\TaskManagerService\Domain\ValueObjects\ProjectId;
use App\Services\TaskManagerService\Domain\ValueObjects\TaskId;
use App\Services\TaskManagerService\Domain\ValueObjects\UserId;
use InvalidArgumentException;
use Zolta\Domain\Aggregates\AggregateRoot;

final class Task extends AggregateRoot
{
    private function __construct(private TaskId $id, private ProjectId $projectId, private UserId $ownerId, private string $title, private ?string $description, private TaskStatus $status, private TaskPriority $priority) {}

    public static function create(ProjectId $projectId, UserId $ownerId, string $title, ?string $description = null, TaskPriority $priority = TaskPriority::Medium, ?TaskId $id = null): self
    {
        self::assertTitle($title);
        return new self($id ?? TaskId::default(), $projectId, $ownerId, trim($title), self::clean($description), TaskStatus::Todo, $priority);
    }

    public static function restore(TaskId $id, ProjectId $projectId, UserId $ownerId, string $title, ?string $description, TaskStatus $status, TaskPriority $priority): self
    {
        return new self($id, $projectId, $ownerId, $title, $description, $status, $priority);
    }

    public function rename(string $title): void { self::assertTitle($title); $this->title = trim($title); }
    public function changeDescription(?string $description): void { $this->description = self::clean($description); }
    public function changePriority(TaskPriority $priority): void { $this->priority = $priority; }
    public function changeStatus(TaskStatus $status): void
    {
        if ($this->status->isDone() && ! $status->isDone()) throw InvalidTaskTransition::fromDone();
        $this->status = $status;
    }
    public function id(): TaskId { return $this->id; }
    public function projectId(): ProjectId { return $this->projectId; }
    public function ownerId(): UserId { return $this->ownerId; }
    public function title(): string { return $this->title; }
    public function description(): ?string { return $this->description; }
    public function status(): TaskStatus { return $this->status; }
    public function priority(): TaskPriority { return $this->priority; }

    private static function assertTitle(string $title): void
    {
        $title = trim($title);
        if ($title === '' || mb_strlen($title) > 160) throw new InvalidArgumentException('Task title must be between 1 and 160 characters.');
    }

    private static function clean(?string $value): ?string
    {
        $value = $value === null ? null : trim($value);
        return $value === '' ? null : $value;
    }
}
