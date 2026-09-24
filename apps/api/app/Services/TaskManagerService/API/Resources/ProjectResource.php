<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\API\Resources;

use Zolta\Http\Response\Resources\Resource;

final class ProjectResource extends Resource
{
    public function toArray(): array { return ['project' => $this->get('project')?->toArray() ?? $this->all()]; }
}
