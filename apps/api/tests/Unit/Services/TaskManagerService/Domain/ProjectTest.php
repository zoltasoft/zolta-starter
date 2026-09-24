<?php

declare(strict_types=1);

namespace Tests\Unit\Services\TaskManagerService\Domain;

use App\Services\TaskManagerService\Domain\Aggregates\Project;
use App\Services\TaskManagerService\Domain\ValueObjects\UserId;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

final class ProjectTest extends TestCase
{
    public function test_creation_normalizes_the_key_and_description(): void
    {
        $project = Project::create(UserId::default(), '  Showcase  ', ' DEMO_KEY ', '  A sample project  ');

        self::assertSame('Showcase', $project->name());
        self::assertSame('demo_key', $project->key());
        self::assertSame('A sample project', $project->description());
        self::assertSame('active', $project->status()->value);
    }

    public function test_invalid_key_is_rejected_by_the_domain(): void
    {
        $this->expectException(InvalidArgumentException::class);
        Project::create(UserId::default(), 'Showcase', 'not valid');
    }
}
