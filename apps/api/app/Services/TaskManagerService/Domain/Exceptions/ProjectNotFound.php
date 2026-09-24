<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Domain\Exceptions;

use RuntimeException;

final class ProjectNotFound extends RuntimeException
{
    public function __construct() { parent::__construct('Project was not found for the authenticated owner.'); }
}
