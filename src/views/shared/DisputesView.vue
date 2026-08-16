<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-slate-100 pb-4">
      <div>
        <div class="flex items-center gap-2 mb-1.5">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase tracking-widest rounded-full">
            Mediation Hub
          </span>
        </div>
        <h1 class="text-2xl font-bold tracking-tight font-heading text-dark">Dispute Arbitration Console</h1>
        <p class="text-xs text-slate-500 mt-1">
          Mediating property disputes, security deposit claims, and transaction issues.
        </p>
      </div>
    </div>

    <!-- 1. TABLE LIST DESIGN -->
    <div v-if="!selectedDispute" class="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      <div class="p-5 border-b border-slate-100 flex items-center justify-between">
        <h2 class="text-sm font-bold font-heading text-slate-800 uppercase tracking-wider">Active Disputes Queue</h2>
        <span class="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-black">
          {{ disputes.length }} Cases
        </span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <th class="py-3 px-5">Case ID</th>
              <th class="py-3 px-5">Type</th>
              <th class="py-3 px-5">Complainant</th>
              <th class="py-3 px-5">Respondent</th>
              <th class="py-3 px-5">Status</th>
              <th class="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in pagedDisputes" :key="d.id" 
              @click="selectDispute(d)"
              class="border-b border-slate-100 hover:bg-slate-50/50 transition-colors cursor-pointer group">
              <td class="py-3.5 px-5 font-mono text-slate-800 font-semibold">
                #{{ d.id.substring(0, 8) }}...
              </td>
              <td class="py-3.5 px-5">
                <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-50 border border-brand-100 text-brand-700">
                  {{ d.type }}
                </span>
              </td>
              <td class="py-3.5 px-5 text-slate-600 font-medium truncate max-w-[120px]">{{ d.complainant_id }}</td>
              <td class="py-3.5 px-5 text-slate-600 font-medium truncate max-w-[120px]">{{ d.respondent_id }}</td>
              <td class="py-3.5 px-5">
                <span :class="['inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase border', 
                  d.status === 'resolved' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-amber-50 border-amber-100 text-amber-700']">
                  {{ d.status }}
                </span>
              </td>
              <td class="py-3.5 px-5 text-right">
                <button class="bg-brand-500 group-hover:bg-brand-600 text-dark font-black px-3.5 py-1.5 rounded-lg text-[10px] transition-colors">
                  Open Chat
                </button>
              </td>
            </tr>
            <tr v-if="disputes.length === 0">
              <td colspan="6" class="py-12 text-center text-slate-400 text-xs">
                🎉 No active disputes logged in your profile.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 2. CONVERSATION AREA -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      <!-- Sidebar panel with meta specs -->
      <div class="space-y-4">
        <button @click="selectedDispute = null" class="w-full border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 font-semibold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-1">
          ← Back to Queue List
        </button>

        <div class="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 class="font-heading font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">Case Overview</h3>
          
          <div class="space-y-3 text-[11px] text-slate-500">
            <div>
              <span class="font-bold text-slate-400 uppercase text-[9px] block">Case Reference ID</span>
              <span class="font-mono font-semibold text-slate-700">{{ selectedDispute.id }}</span>
            </div>
            <div>
              <span class="font-bold text-slate-400 uppercase text-[9px] block">Linked Entity</span>
              <span class="font-semibold text-slate-700 capitalize">{{ selectedDispute.source_ref_entity }}</span>
            </div>
            <div>
              <span class="font-bold text-slate-400 uppercase text-[9px] block">Source Reference ID</span>
              <span class="font-mono font-semibold text-slate-700">{{ selectedDispute.source_ref_id }}</span>
            </div>
            <div>
              <span class="font-bold text-slate-400 uppercase text-[9px] block flex items-center gap-1">
                Complainant User
                <span :class="['w-1.5 h-1.5 rounded-full', complainantOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400']" :title="complainantOnline ? 'Online' : 'Offline'"></span>
              </span>
              <span class="font-semibold text-slate-700 truncate block">{{ selectedDispute.complainant_id }}</span>
            </div>
            <div>
              <span class="font-bold text-slate-400 uppercase text-[9px] block flex items-center gap-1">
                Respondent User
                <span :class="['w-1.5 h-1.5 rounded-full', respondentOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400']" :title="respondentOnline ? 'Online' : 'Offline'"></span>
              </span>
              <span class="font-semibold text-slate-700 truncate block">{{ selectedDispute.respondent_id }}</span>
            </div>
            <div v-if="selectedDispute.status !== 'resolved' && !selectedDispute.escalated">
              <button 
                @click="escalateCase"
                class="w-full mt-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-1.5 px-3 rounded-lg border border-indigo-200 text-[10px] transition-colors"
              >
                ⚠️ Escalate to Platform Admin
              </button>
            </div>
            <div v-else-if="selectedDispute.escalated" class="bg-indigo-50 border border-indigo-150 text-indigo-800 rounded-lg p-2 text-[10px] font-semibold mt-2">
              🚨 Escalated to Platform Arbitration
            </div>
          </div>
        </div>
      </div>

      <!-- Main Conversation & Chat Workspace -->
      <div class="lg:col-span-2 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col min-h-[500px]">
        <!-- Chat Header -->
        <div class="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
          <div>
            <h2 class="font-heading font-bold text-sm text-slate-900">Arbitration Session #{{ selectedDispute.id.substring(0, 8) }}</h2>
            <p class="text-[10px] text-slate-400 mt-0.5">Mediating case under REOS platform Terms of Service.</p>
          </div>
          <!-- Action to resolve (Superadmin only) -->
          <button 
            v-if="isAdmin && selectedDispute.status !== 'resolved'" 
            @click="showResolveModal = true"
            class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] py-2 px-3 rounded-lg">
            Issue Ruling
          </button>
        </div>

        <!-- Official Resolution notes -->
        <div v-if="selectedDispute.status === 'resolved'" class="m-5 p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs space-y-1.5">
          <div class="font-bold flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Arbitrator Final Ruling:
          </div>
          <p class="leading-relaxed">{{ selectedDispute.resolution_notes }}</p>
          <div class="text-[9px] text-emerald-500 font-mono mt-1">Resolved by Admin: {{ selectedDispute.assigned_admin_id }}</div>
        </div>

        <!-- Chat messages view -->
        <div class="flex-grow p-5 space-y-4 overflow-y-auto max-h-[350px] bg-slate-50/30">
          <div 
            v-for="(msg, idx) in selectedDispute.messages" 
            :key="idx"
            :class="['max-w-[75%] p-3.5 rounded-2xl text-xs flex flex-col', 
              msg.senderID === currentUserID || msg.sender_id === currentUserID 
                ? 'bg-brand-500 text-dark font-medium ml-auto rounded-tr-none' 
                : 'bg-white border border-slate-100 text-slate-800 mr-auto rounded-tl-none'
            ]"
          >
            <span class="font-bold text-[9px] mb-1 opacity-70">
              {{ msg.senderID === currentUserID || msg.sender_id === currentUserID ? 'You' : msg.senderID || msg.sender_id }}
            </span>
            <p class="leading-relaxed">{{ msg.content }}</p>
            <span class="text-[8px] mt-1 opacity-55 text-right font-mono">{{ formatTime(msg.sent_at) }}</span>
          </div>
          <div v-if="!selectedDispute.messages || selectedDispute.messages.length === 0" class="text-center py-12 text-slate-400 text-xs">
            No conversation records logged for this session.
          </div>
        </div>

        <!-- Typing indicator -->
        <div v-if="partnerTyping" class="px-5 py-2 text-[10px] italic text-slate-400 flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
          <span>Partner is typing arbitration statement...</span>
        </div>

        <!-- Reply footer & Tipping preset -->
        <div v-if="selectedDispute.status !== 'resolved'" class="p-4 border-t border-slate-100 bg-white rounded-b-2xl space-y-3">
          <!-- Tipping preset chips -->
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-[9px] text-slate-400 uppercase font-extrabold">Tip Arbitrator:</span>
            <button 
              v-for="amt in [200, 500, 1000]" 
              :key="amt" 
              @click="sendTip(amt)"
              class="text-[9px] font-bold px-2 py-0.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-slate-200 rounded-full transition-all text-slate-600"
            >
              💸 KES {{ amt }}
            </button>
          </div>

          <form @submit.prevent="sendMessage" class="flex gap-2">
            <input 
              v-model="replyText" 
              @input="onTyping"
              type="text" 
              placeholder="Type response text or arbitration statement..." 
              required 
              class="flex-grow border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
            <button type="submit" class="bg-brand-500 hover:bg-brand-600 text-dark font-black px-5 rounded-xl text-xs transition-colors">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal: Resolve Dispute -->
    <Teleport to="body">
      <div v-if="showResolveModal" class="modal-overlay">
        <div class="modal-container max-w-md">
          <div class="modal-header">
            <h3 class="text-base font-bold font-heading text-slate-900">Issue Arbitration Ruling</h3>
            <button @click="showResolveModal = false" class="modal-close">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <form @submit.prevent="submitResolution" class="space-y-4">
            <p class="text-xs text-slate-500">
              Provide the binding platform resolution. This action resolves the dispute and restricts further replies.
            </p>
            <div>
              <label class="form-label">Binding Ruling notes</label>
              <textarea v-model="resolutionNotes" placeholder="State final arbitration decision..." required class="form-input h-28 resize-none text-xs"></textarea>
            </div>
            <div class="flex gap-3">
              <button type="button" @click="showResolveModal = false" class="flex-1 border border-slate-200 text-slate-600 font-semibold py-2 rounded-xl text-xs">Cancel</button>
              <button type="submit" :disabled="resolving" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs disabled:opacity-50">Submit Decision</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  
        <PaginationBar
          :current-page="currentPage" :total-pages="totalPages" :total-items="totalItems"
          :start-item="startItem" :end-item="endItem" :page-numbers="pageNumbers"
          :page-size="pageSize"
          @prev="prevPage" @next="nextPage" @go="goToPage"
          @update:pageSize="pageSize = $event"
          class="px-4 pb-4"
        />
</div>
</template>

<script>
import { usePagination } from '@/composables/usePagination';
import { ref, computed, onMounted } from 'vue';
import { useAppStore } from '@/stores/store';

export default {
  name: 'DisputesView',
  setup() {
    const store = useAppStore();

    const selectedDispute = ref(null);
    const replyText = ref('');
    const showResolveModal = ref(false);
    const resolutionNotes = ref('');
    const resolving = ref(false);

    const disputes = computed(() => store.disputes);
    const isAdmin = computed(() => store.user?.role === 'superadmin' || store.user?.role === 'support_admin');
    const currentUserID = computed(() => store.user?.id || '');

    // Real-time states
    const partnerTyping = ref(false);
    const complainantOnline = ref(false);
    const respondentOnline = ref(false);
    let typingTimer = null;

    const loadData = async () => {
      await store.fetchDisputes();
      if (store.socket) {
        const origOnMessage = store.socket.onmessage;
        store.socket.onmessage = (event) => {
          try {
            const wsMsg = JSON.parse(event.data);
            if (wsMsg.type === 'typing' && wsMsg.payload?.dispute_id === selectedDispute.value?.id) {
              if (wsMsg.payload?.sender_id !== currentUserID.value) {
                partnerTyping.value = true;
                clearTimeout(typingTimer);
                typingTimer = setTimeout(() => { partnerTyping.value = false; }, 3000);
              }
            }
            if (wsMsg.type === 'dispute_chat' && wsMsg.payload?.dispute_id === selectedDispute.value?.id) {
              const msgVal = wsMsg.payload.message;
              if (msgVal && selectedDispute.value) {
                if (!selectedDispute.value.messages) selectedDispute.value.messages = [];
                // Check if message already exists
                const exists = selectedDispute.value.messages.some(
                  m => m.sender_id === msgVal.sender_id && m.content === msgVal.content && m.sent_at === msgVal.sent_at
                );
                if (!exists) {
                  selectedDispute.value.messages.push(msgVal);
                }
              }
            }
            if (wsMsg.type === 'presence') {
              if (selectedDispute.value) {
                if (wsMsg.user_id === selectedDispute.value.complainant_id) {
                  complainantOnline.value = (wsMsg.payload?.status === 'online');
                }
                if (wsMsg.user_id === selectedDispute.value.respondent_id) {
                  respondentOnline.value = (wsMsg.payload?.status === 'online');
                }
              }
            }
          } catch(e) {}
          if (origOnMessage) origOnMessage(event);
        };
      }
    };

    const selectDispute = (d) => {
      selectedDispute.value = d;
      complainantOnline.value = false;
      respondentOnline.value = false;
      // Request active statuses by broadcasting check if needed, or wait for presence heartbeats
    };

    const sendMessage = async () => {
      if (!selectedDispute.value || !replyText.value) return;
      try {
        await store.addDisputeMessage(selectedDispute.value.id, replyText.value);
        replyText.value = '';
        partnerTyping.value = false;
        // Local refresh
        const index = disputes.value.findIndex(d => d.id === selectedDispute.value.id);
        if (index !== -1) {
          selectedDispute.value = disputes.value[index];
        }
      } catch (e) {
        console.error(e);
      }
    };

    const onTyping = () => {
      if (store.socket && store.socket.readyState === WebSocket.OPEN && selectedDispute.value) {
        store.socket.send(JSON.stringify({
          type: 'typing',
          payload: {
            dispute_id: selectedDispute.value.id,
            sender_id: currentUserID.value
          }
        }));
      }
    };

    const sendTip = async (amount) => {
      if (!selectedDispute.value) return;
      const message = `💸 Tipped KES ${amount} to arbitration support.`;
      try {
        await store.addDisputeMessage(selectedDispute.value.id, message);
        store.success = `Tipped KES ${amount} successfully!`;
        const index = disputes.value.findIndex(d => d.id === selectedDispute.value.id);
        if (index !== -1) {
          selectedDispute.value = disputes.value[index];
        }
      } catch (err) {
        console.error(err);
      }
    };

    const escalateCase = async () => {
      if (!selectedDispute.value) return;
      try {
        await store.escalateDispute(selectedDispute.value.id);
        selectedDispute.value.escalated = true;
      } catch (err) {
        alert(err.message);
      }
    };

    const submitResolution = async () => {
      resolving.value = true;
      try {
        await store.resolveDispute(selectedDispute.value.id, resolutionNotes.value);
        showResolveModal.value = false;
        resolutionNotes.value = '';
        await loadData();
        // Refresh local details
        selectedDispute.value = disputes.value.find(d => d.id === selectedDispute.value.id);
      } catch (e) {
        console.error(e);
      } finally {
        resolving.value = false;
      }
    };

    const formatTime = (tStr) => {
      if (!tStr) return '-';
      const d = new Date(tStr);
      return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    };

    onMounted(loadData);


    // --- Pagination ---
    const { paginatedItems: pagedDisputes, currentPage, totalPages, totalItems, startItem, endItem, pageNumbers, pageSize, prevPage, nextPage, goToPage } = usePagination(disputes);
        return {
      disputes,
      selectedDispute,
      replyText,
      showResolveModal,
      resolutionNotes,
      resolving,
      isAdmin,
      currentUserID,
      partnerTyping,
      complainantOnline,
      respondentOnline,
      selectDispute,
      sendMessage,
      onTyping,
      sendTip,
      escalateCase,
      submitResolution,
      formatTime, pagedDisputes, currentPage, totalPages, totalItems, startItem, endItem, pageNumbers, pageSize, prevPage, nextPage, goToPage
    };
  }
};
</script>
