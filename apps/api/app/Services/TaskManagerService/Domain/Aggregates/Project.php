<?php

declare(strict_types=1);

namespace App\Services\TaskManagerService\Domain\Aggregates;

use App\Services\TaskManagerService\Domain\Enums\ProjectStatus;
use App\Services\TaskManagerService\Domain\ValueObjects\ProjectId;
use App\Services\TaskManagerService\Domain\ValueObjects\UserId;
use InvalidArgumentException;
use Zolta\Domain\Aggregates\AggregateRoot;

final class Project extends AggregateRoot
{
    private function __construct(private ProjectId $id, private UserId $ownerId, private string $name, private string $key, private ?string $description, private ProjectStatus $status) {}

    public static function create(UserId $ownerId, string $name, string $key, ?string $description = null, ?ProjectId $id = null): self
    {
        $name = trim($name);
        $key = strtolower(trim($key));
        self::assertText($name, 'Project name', 120);
        self::assertText($key, 'Project key', 32);
        if (! preg_match('/^[A-Za-z0-9_-]+$/', $key)) throw new InvalidArgumentException('Project key may contain only letters, numbers, dashes, and underscores.');
        return new self($id ?? ProjectId::default(), $ownerId, $name, $key, self::clean($description), ProjectStatus::Active);
    }

    public static function restore(ProjectId $id, UserId $ownerId, string $name, string $key, ?string $description, ProjectStatus $status): self
    {
        return new self($id, $ownerId, $name, $key, $description, $status);
    }

    public function id(): ProjectId { return $this->id; }
    public function ownerId(): UserId { return $this->ownerId; }
    public function name(): string { return $this->name; }
    public function key(): string { return $this->key; }
    public function description(): ?string { return $this->description; }
    public function status(): ProjectStatus { return $this->status; }

    private static function clean(?string $value): ?string
    {
        $value = $value === null ? null : trim($value);
        return $value === '' ? null : $value;
    }

    private static function assertText(string $value, string $label, int $max): void
    {
        if ($value === '' || mb_strlen($value) > $max) throw new InvalidArgumentException("{$label} must be between 1 and {$max} characters.");
    }
}
