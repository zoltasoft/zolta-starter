<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\API\Requests\Concerns;

use Zolta\Http\Authorization\Identity;

trait ResolvesAuthenticatedIdentity
{
    protected function hasAuthenticatedIdentity(): bool { return Identity::current() !== null; }
    protected function authenticatedUserId(): string { return (string) Identity::current()?->getId(); }
}
