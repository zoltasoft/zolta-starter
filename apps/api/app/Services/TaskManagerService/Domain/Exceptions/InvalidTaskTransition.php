<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Domain\Exceptions;

use DomainException;

final class InvalidTaskTransition extends DomainException
{
    public static function fromDone(): self
    {
        return new self('A completed task cannot be moved back to an active status.');
    }
}
