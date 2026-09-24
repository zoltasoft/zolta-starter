<?php

use App\Providers\AppServiceProvider;
use App\Services\TaskManagerService\Infrastructure\Providers\TaskManagerServiceProvider;

return [
    AppServiceProvider::class,
    TaskManagerServiceProvider::class,
];
