-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "escort_profiles_city_idx" ON "escort_profiles"("city");

-- CreateIndex
CREATE INDEX "escort_profiles_displayName_idx" ON "escort_profiles"("displayName");

-- CreateIndex
CREATE INDEX "payments_createdAt_idx" ON "payments"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "messages_roomId_createdAt_idx" ON "messages"("roomId", "createdAt" DESC);
