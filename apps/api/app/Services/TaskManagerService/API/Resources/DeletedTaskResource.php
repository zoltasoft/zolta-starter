<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\API\Resources;

use Zolta\Http\Response\Resources\Resource;

final class DeletedTaskResource extends Resource
{
    public function toArray(): array
    {
        return [
            'deleted' => $this->get('deleted'),
            'task_id' => $this->get('task_id'),
        ];
    }
}
