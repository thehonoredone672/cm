-- CreateIndex
CREATE INDEX "TeamInvite_senderId_idx" ON "TeamInvite"("senderId");

-- CreateIndex
CREATE INDEX "TeamInvite_receiverId_idx" ON "TeamInvite"("receiverId");

-- CreateIndex
CREATE INDEX "TeamInvite_status_idx" ON "TeamInvite"("status");
