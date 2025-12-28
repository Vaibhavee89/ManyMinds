<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_type_check');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No easy way to re-add the exact same enum constraint without knowing the old values perfectly,
        // and we moved to string anyway.
    }
};
