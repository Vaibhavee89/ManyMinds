<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Enable pgvector extension
        DB::statement('CREATE EXTENSION IF NOT EXISTS vector');

        Schema::create('ai_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('display_name');
            $table->string('avatar_url')->nullable();
            $table->jsonb('base_personality_json');
            $table->text('base_system_prompt');
            $table->unsignedBigInteger('active_prompt_version_id')->nullable();
            $table->timestamps();
        });

        Schema::create('ai_profile_prompt_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ai_profile_id')->constrained()->onDelete('cascade');
            $table->text('system_prompt');
            $table->text('tuning_summary')->nullable();
            $table->unsignedBigInteger('created_from_feedback_id')->nullable();
            $table->timestamps();
        });

        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('ai_profile_id')->constrained()->onDelete('cascade');
            $table->string('title')->nullable();
            $table->timestamp('last_message_at')->nullable();
            $table->timestamps();
        });

        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained()->onDelete('cascade');
            $table->enum('sender_type', ['user', 'assistant', 'system']);
            $table->text('body');
            $table->jsonb('metadata_json')->nullable();
            $table->timestamps();
        });

        Schema::create('message_feedback', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained()->onDelete('cascade');
            $table->foreignId('message_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('rating'); // 1-5
            $table->jsonb('tags_json')->nullable();
            $table->text('comment')->nullable();
            $table->timestamps();
        });

        Schema::create('ai_memories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ai_profile_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('memory_text');
            $table->addColumn('vector', 'embedding', ['length' => 1536]); // OpenAI embeddings size
            $table->float('importance')->default(0.5);
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();
        });

        // Update ai_profiles to link to active version
        Schema::table('ai_profiles', function (Blueprint $table) {
            $table->foreign('active_prompt_version_id')->references('id')->on('ai_profile_prompt_versions')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_memories');
        Schema::dropIfExists('message_feedback');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('conversations');
        Schema::table('ai_profiles', function (Blueprint $table) {
            $table->dropForeign(['active_prompt_version_id']);
        });
        Schema::dropIfExists('ai_profile_prompt_versions');
        Schema::dropIfExists('ai_profiles');
    }
};
