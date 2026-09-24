<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Application\Projections;

final readonly class ProjectView
{
    public function __construct(public string $id, public string $ownerId, public string $name, public string $key, public ?string $description, public string $status, public int $tasksCount) {}
}
