<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Application\Projections;

final readonly class TaskView
{
    public function __construct(public string $id, public string $projectId, public string $ownerId, public string $title, public ?string $description, public string $status, public string $priority) {}
}
