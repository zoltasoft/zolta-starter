<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Domain\Exceptions;

use RuntimeException;

final class TaskNotFound extends RuntimeException
{
    public function __construct() { parent::__construct('Task was not found for the authenticated owner.'); }
}
