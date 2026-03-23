import { invoke } from '@tauri-apps/api/core';

const elAccountId = document.getElementById('accountId') as HTMLInputElement;
const elToken = document.getElementById('token') as HTMLInputElement;
const btnSave = document.getElementById('saveBtn') as HTMLButtonElement;

const btnLangToggle = document.getElementById('langToggleBtn') as HTMLButtonElement;
const elIndexSelect = document.getElementById('indexSelect') as HTMLSelectElement;
const elIndexInfo = document.getElementById('indexInfo') as HTMLSpanElement;
const btnRefreshIndex = document.getElementById('refreshIndexBtn') as HTMLButtonElement;
const btnRefreshCurrentIndex = document.getElementById('refreshCurrentIndexBtn') as HTMLButtonElement;

const btnFetchSample = document.getElementById('fetchSampleBtn') as HTMLButtonElement;
const elSpecificIds = document.getElementById('specificIds') as HTMLInputElement;
const btnFetchIds = document.getElementById('fetchIdsBtn') as HTMLButtonElement;

const elSearchText = document.getElementById('searchText') as HTMLInputElement;
const elEmbeddingModel = document.getElementById('embeddingModel') as HTMLSelectElement;
const btnSearchByText = document.getElementById('searchByTextBtn') as HTMLButtonElement;

const elSelectAll = document.getElementById('selectAll') as HTMLInputElement;
const btnDeleteSelected = document.getElementById('deleteSelectedBtn') as HTMLButtonElement;
const elSelectedCount = document.getElementById('selectedCount') as HTMLSpanElement;
const elResultBody = document.getElementById('resultBody') as HTMLTableSectionElement;

const tabSample = document.getElementById('tabSample') as HTMLButtonElement;
const tabIds = document.getElementById('tabIds') as HTMLButtonElement;
const tabSearch = document.getElementById('tabSearch') as HTMLButtonElement;
const contentSample = document.getElementById('content-sample') as HTMLDivElement;
const contentIds = document.getElementById('content-ids') as HTMLDivElement;
const contentSearch = document.getElementById('content-search') as HTMLDivElement;

const thVectorId = document.getElementById('thVectorId') as HTMLTableCellElement;
const thScore = document.getElementById('thScore') as HTMLTableCellElement;
const thMetadata = document.getElementById('thMetadata') as HTMLTableCellElement;
const tdNoData = document.getElementById('tdNoData') as HTMLTableCellElement;

let currentDimension = 0;
let currentLang: 'zh' | 'en' = 'en';

const i18n = {
  zh: {
    appName: 'GUI for Cloudflare Vectorize',
    langToggle: '切换语言',
    accountPlaceholder: 'Account ID',
    tokenPlaceholder: 'API Token',
    saveBtn: '保存并连接',
    selectIndex: '选择 Index:',
    refreshList: '刷新列表',
    refreshCurrent: '刷新当前索引',
    fetchSample: '随机采样 10 条',
    specificIds: '输入 ID 查找 (逗号分隔)',
    searchButton: '精确查找',
    deleteSelected: '删除选中',
    searchText: '输入内容进行相似度查找',
    contentSearch: '内容查找',
    dimensionsData: '维度',
    vectorCount: '数据量',
    loading: '加载中...',
    loadingIndexInfo: '正在获取索引信息...',
    noIndexes: '账号下暂无索引',
    loadFailed: '加载失败',
    fillCredentials: '请填写 Account ID 和 Token',
    fetchIndexFailed: '获取索引失败',
    networkError: '网络错误',
    tabSample: '随机采样',
    tabIds: 'ID 精确查找',
    tabSearch: '内容相似度查找',
    noData: '暂无数据',
    fetchingSample: '正在拉取样本...',
    searching: '正在查找...',
    generatingVector: '正在生成向量并查找...',
    failed: '失败',
    error: '错误',
    generatingVectorFailed: '生成向量失败',
    queryFailed: '查询失败',
    deleteSuccess: '成功删除',
    deleteFailed: '删除失败',
    connectFirst: '-- 请先连接账号 --',
    tableHeaderId: '向量 ID',
    tableHeaderScore: '分数',
    tableHeaderMetadata: '元数据 (JSON)',
    selectIndexAndLoad: '请选择索引并加载数据',
    dimensionMismatch: '向量维度不匹配',
    confirmDeleteTitle: '确认删除',
    confirmDelete: '确定要彻底删除选中的 {count} 个 Vector 吗？',
    deleting: '删除中...',
    requestError: '请求错误',
    confirm: '确认',
    cancel: '取消',
    notice: '提示'
  },
  en: {
    appName: 'GUI for Cloudflare Vectorize',
    langToggle: 'Switch Language',
    accountPlaceholder: 'Account ID',
    tokenPlaceholder: 'API Token',
    saveBtn: 'Save and Connect',
    selectIndex: 'Select Index:',
    refreshList: 'Refresh List',
    refreshCurrent: 'Refresh Current Index',
    fetchSample: 'Random Sample 10',
    specificIds: 'Input ID lookup (comma separated)',
    searchButton: 'Exact Search',
    deleteSelected: 'Delete Selected',
    searchText: 'Input text for similarity search',
    contentSearch: 'Content Search',
    dimensionsData: 'Dim',
    vectorCount: 'Count',
    loading: 'Loading...',
    loadingIndexInfo: 'Loading index info...',
    noIndexes: 'No indexes under account',
    loadFailed: 'Load failed',
    fillCredentials: 'Please fill in Account ID and Token',
    fetchIndexFailed: 'Failed to fetch indexes',
    networkError: 'Network error',
    tabSample: 'Random Sample',
    tabIds: 'Exact ID Search',
    tabSearch: 'Content Similarity Search',
    noData: 'No data',
    fetchingSample: 'Fetching samples...',
    searching: 'Searching...',
    generatingVector: 'Generating vector and searching...',
    failed: 'Failed',
    error: 'Error',
    generatingVectorFailed: 'Failed to generate vector',
    queryFailed: 'Query failed',
    deleteSuccess: 'Successfully deleted',
    deleteFailed: 'Delete failed',
    connectFirst: '-- Please connect account first --',
    tableHeaderId: 'Vector ID',
    tableHeaderScore: 'Score',
    tableHeaderMetadata: 'Metadata (JSON)',
    selectIndexAndLoad: 'Please select an index and load data',
    dimensionMismatch: 'Vector dimension mismatch',
    confirmDeleteTitle: 'Confirm Deletion',
    confirmDelete: 'Are you sure you want to completely delete the selected {count} vectors?',
    deleting: 'Deleting...',
    requestError: 'Request error',
    confirm: 'Confirm',
    cancel: 'Cancel',
    notice: 'Notice'
  }
};

window.addEventListener('DOMContentLoaded', () => {
  elAccountId.value = localStorage.getItem('cf_accountId') || '';
  elToken.value = localStorage.getItem('cf_token') || '';
  const defaultLang = navigator.language.startsWith('zh') ? 'zh' : 'en';
  const lang = (localStorage.getItem('lang') as 'zh' | 'en') || defaultLang;
  applyLanguage(lang);
  if (elAccountId.value && elToken.value) {
    loadIndexes();
  }

  function switchTab(tabName: 'sample' | 'ids' | 'search') {
    contentSample.classList.add('hidden');
    contentIds.classList.add('hidden');
    contentSearch.classList.add('hidden');

    tabSample.classList.remove('tab-active', 'border-blue-500', 'text-blue-700');
    tabSample.classList.add('border-transparent', 'text-gray-600');
    tabIds.classList.remove('tab-active', 'border-teal-500', 'text-teal-700');
    tabIds.classList.add('border-transparent', 'text-gray-600');
    tabSearch.classList.remove('tab-active', 'border-purple-500', 'text-purple-700');
    tabSearch.classList.add('border-transparent', 'text-gray-600');

    if (tabName === 'sample') {
      contentSample.classList.remove('hidden');
      tabSample.classList.add('tab-active', 'border-blue-500', 'text-blue-700');
      tabSample.classList.remove('border-transparent', 'text-gray-600');
    } else if (tabName === 'ids') {
      contentIds.classList.remove('hidden');
      tabIds.classList.add('tab-active', 'border-teal-500', 'text-teal-700');
      tabIds.classList.remove('border-transparent', 'text-gray-600');
    } else if (tabName === 'search') {
      contentSearch.classList.remove('hidden');
      tabSearch.classList.add('tab-active', 'border-purple-500', 'text-purple-700');
      tabSearch.classList.remove('border-transparent', 'text-gray-600');
    }
  }

  tabSample.addEventListener('click', () => switchTab('sample'));
  tabIds.addEventListener('click', () => switchTab('ids'));
  tabSearch.addEventListener('click', () => switchTab('search'));
});

btnSave.addEventListener('click', () => {
  localStorage.setItem('cf_accountId', elAccountId.value.trim());
  localStorage.setItem('cf_token', elToken.value.trim());
  loadIndexes();
});

function showModal(title: string, message: string, isConfirm: boolean = false): Promise<boolean> {
  return new Promise((resolve) => {
    const modalBg = document.createElement('div');
    modalBg.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'bg-white rounded-lg shadow-xl p-6 w-[90%] max-w-md max-h-[80vh] flex flex-col';
    
    const titleEl = document.createElement('h3');
    titleEl.className = 'text-lg font-bold text-gray-800 mb-2 shrink-0';
    titleEl.textContent = title;
    
    const msgEl = document.createElement('div');
    msgEl.className = 'text-sm text-gray-600 mb-6 overflow-y-auto whitespace-pre-wrap break-all';
    msgEl.textContent = message;
    
    const btnContainer = document.createElement('div');
    btnContainer.className = 'flex justify-end gap-3 shrink-0';
    
    if (isConfirm) {
      const btnCancel = document.createElement('button');
      btnCancel.className = 'px-4 py-2 rounded text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 transition';
      btnCancel.textContent = i18n[currentLang].cancel;
      btnCancel.onclick = () => {
        document.body.removeChild(modalBg);
        resolve(false);
      };
      btnContainer.appendChild(btnCancel);
    }
    
    const btnOk = document.createElement('button');
    btnOk.className = 'px-4 py-2 rounded text-sm bg-blue-500 hover:bg-blue-600 text-white transition';
    btnOk.textContent = i18n[currentLang].confirm;
    btnOk.onclick = () => {
      document.body.removeChild(modalBg);
      resolve(true);
    };
    btnContainer.appendChild(btnOk);
    
    modalContent.appendChild(titleEl);
    modalContent.appendChild(msgEl);
    modalContent.appendChild(btnContainer);
    modalBg.appendChild(modalContent);
    document.body.appendChild(modalBg);
  });
}

function getCreds() {
  const accountId = elAccountId.value.trim();
  const token = elToken.value.trim();
  if (!accountId || !token) {
    showModal(i18n[currentLang].notice, i18n[currentLang].fillCredentials);
    return null;
  }
  return { accountId, token };
}

function applyLanguage(lang: 'zh' | 'en') {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  const ui = i18n[lang];
  document.querySelector('title')!.textContent = ui.appName;
  (elAccountId as HTMLInputElement).placeholder = ui.accountPlaceholder;
  (elToken as HTMLInputElement).placeholder = ui.tokenPlaceholder;
  btnSave.textContent = ui.saveBtn;
  btnLangToggle.textContent = ui.langToggle;
  (document.getElementById('labelIndex') as HTMLElement).textContent = ui.selectIndex;
  btnRefreshIndex.textContent = ui.refreshList;
  btnRefreshCurrentIndex.textContent = ui.refreshCurrent;
  btnFetchSample.textContent = ui.fetchSample;
  elSpecificIds.placeholder = ui.specificIds;
  btnFetchIds.textContent = ui.searchButton;
  elSearchText.placeholder = ui.searchText;
  btnSearchByText.textContent = ui.contentSearch;
  (btnDeleteSelected.querySelector('span') as HTMLElement).textContent = ui.deleteSelected;
  tabSample.textContent = ui.tabSample;
  tabIds.textContent = ui.tabIds;
  tabSearch.textContent = ui.tabSearch;

  if (elIndexSelect.options.length === 1 && elIndexSelect.value === "") {
    elIndexSelect.options[0].textContent = ui.connectFirst;
  }
  thVectorId.textContent = ui.tableHeaderId;
  thScore.textContent = ui.tableHeaderScore;
  thMetadata.textContent = ui.tableHeaderMetadata;
  if (tdNoData && elResultBody.children.length === 1 && elResultBody.children[0].firstElementChild === tdNoData) {
    tdNoData.textContent = ui.selectIndexAndLoad;
  }
}

btnLangToggle.addEventListener('click', () => {
  const nextLang: 'zh' | 'en' = currentLang === 'zh' ? 'en' : 'zh';
  applyLanguage(nextLang);
});

async function loadIndexes() {
  const creds = getCreds();
  if (!creds) return;

  elIndexSelect.innerHTML = `<option value="">${i18n[currentLang].loading}</option>`;
  elIndexSelect.disabled = true;

  try {
    const data: any = await invoke('cf_api', {
      accountId: creds.accountId,
      token: creds.token,
      path: 'vectorize/v2/indexes',
      method: 'GET',
      body: null
    });

    if (data.success) {
      const indexes: any[] = data.result || [];
      if (indexes.length === 0) {
        elIndexSelect.innerHTML = `<option value="">${i18n[currentLang].noIndexes}</option>`;
        return;
      }

      elIndexSelect.innerHTML = `<option value="">-- ${i18n[currentLang].selectIndex.replace(':', '')} --</option>`;
      indexes.forEach(idx => {
        const opt = document.createElement('option');
        opt.value = idx.name;
        opt.textContent = idx.name;
        elIndexSelect.appendChild(opt);
      });

      elIndexSelect.disabled = false;
      btnRefreshIndex.style.display = 'block';
      btnRefreshCurrentIndex.style.display = 'none';
    } else {
      showModal(i18n[currentLang].fetchIndexFailed, JSON.stringify(data.errors, null, 2));
      elIndexSelect.innerHTML = `<option value="">${i18n[currentLang].loadFailed}</option>`;
      btnRefreshCurrentIndex.style.display = 'none';
    }
  } catch (err) {
    showModal(i18n[currentLang].networkError, String(err));
  }
}

btnRefreshIndex.addEventListener('click', loadIndexes);

async function updateIndexInfo(indexName: string) {
  const creds = getCreds();
  if (!creds) return;

  elIndexInfo.textContent = i18n[currentLang].loadingIndexInfo;
  elIndexInfo.style.display = 'block';

  try {
    const infoData: any = await invoke('cf_api', {
      accountId: creds.accountId,
      token: creds.token,
      path: `vectorize/v2/indexes/${indexName}/info`,
      method: 'GET',
      body: null
    });

    const configData: any = await invoke('cf_api', {
      accountId: creds.accountId,
      token: creds.token,
      path: `vectorize/v2/indexes/${indexName}`,
      method: 'GET',
      body: null
    });

    if (infoData.success && configData.success) {
      const vectorCount = infoData.result?.vector_count ?? infoData.result?.vectorCount ?? 0;
      currentDimension = configData.result?.config?.dimensions || infoData.result?.dimensions || 0;
      elIndexInfo.textContent = `${i18n[currentLang].dimensionsData}: ${currentDimension} | ${i18n[currentLang].vectorCount}: ${vectorCount}`;

      btnFetchSample.disabled = false;
      btnFetchIds.disabled = false;
      btnSearchByText.disabled = false;
      btnRefreshCurrentIndex.style.display = 'block';
    } else {
      elIndexInfo.textContent = i18n[currentLang].loadFailed;
    }
  } catch (err) {
    elIndexInfo.textContent = i18n[currentLang].networkError;
    console.error(err);
  }
}

async function refreshCurrentIndex() {
  const indexName = elIndexSelect.value;
  if (!indexName) return;

  await updateIndexInfo(indexName);
  
  // Clear the table when refreshing current index
  renderTable([]);
}

elIndexSelect.addEventListener('change', async () => {
  const indexName = elIndexSelect.value;
  if (!indexName) {
    btnFetchSample.disabled = true;
    btnFetchIds.disabled = true;
    btnSearchByText.disabled = true;
    elIndexInfo.style.display = 'none';
    btnRefreshCurrentIndex.style.display = 'none';
    return;
  }

  await updateIndexInfo(indexName);
});

btnRefreshCurrentIndex.addEventListener('click', refreshCurrentIndex);

// === 5. 拉取数据 (渲染表格) ===
function renderTable(vectors: any[]) {
  if (vectors.length === 0) {
    elResultBody.innerHTML = `<tr><td colspan="4" class="px-4 py-8 text-center text-gray-500">${i18n[currentLang].noData}</td></tr>`;
    updateSelection();
    return;
  }

  elResultBody.innerHTML = vectors.map(v => {
    const metaStr = JSON.stringify(v.metadata || {});
    // Escape single quotes, double quotes, and other problematic characters for HTML attributes
    const safeMetaStr = metaStr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    return `
    <tr class="hover:bg-gray-100 transition">
      <td class="px-4 py-2 text-center border-r">
        <input type="checkbox" class="row-checkbox w-4 h-4 cursor-pointer" value="${v.id}">
      </td>
      <td class="px-4 py-2 font-mono text-blue-600 border-r">${v.id}</td>
      <td class="px-4 py-2 text-emerald-600 border-r">${v.score ? v.score.toFixed(4) : '-'}</td>
      <td class="px-4 py-2 font-mono text-xs text-gray-500 overflow-hidden text-ellipsis max-w-lg" title="${safeMetaStr}">
        ${metaStr}
      </td>
    </tr>
  `}).join('');

  document.querySelectorAll('.row-checkbox').forEach(cb => {
    cb.addEventListener('change', updateSelection);
  });
  updateSelection();
}

btnFetchSample.addEventListener('click', async () => {
  const creds = getCreds();
  const indexName = elIndexSelect.value;
  if (!creds || !indexName || currentDimension === 0) return;

  elResultBody.innerHTML = `<tr><td colspan="4" class="px-4 py-8 text-center text-blue-500 animate-pulse">${i18n[currentLang].fetchingSample}</td></tr>`;

  const zeroVector = new Array(currentDimension).fill(0);

  try {
    const data: any = await invoke('cf_api', {
      accountId: creds.accountId,
      token: creds.token,
      path: `vectorize/v2/indexes/${indexName}/query`,
      method: 'POST',
      body: { vector: zeroVector, topK: 10, returnValues: false, returnMetadata: 'all' }
    });

    if (data.success) {
      renderTable(data.result.matches || []);
    } else {
      elResultBody.innerHTML = `<tr><td colspan="4" class="text-center text-red-500">${i18n[currentLang].failed}</td></tr>`;
      showModal(i18n[currentLang].failed, JSON.stringify(data.errors, null, 2));
    }
  } catch (err) {
    elResultBody.innerHTML = `<tr><td colspan="4" class="text-center text-red-500">${i18n[currentLang].error}</td></tr>`;
    showModal(i18n[currentLang].error, String(err));
  }
});

btnFetchIds.addEventListener('click', async () => {
  const creds = getCreds();
  const indexName = elIndexSelect.value;
  const rawIds = elSpecificIds.value.trim();
  if (!creds || !indexName || !rawIds) return;

  const ids = rawIds.split(',').map(id => id.trim()).filter(id => id);
  if (ids.length === 0) return;

  elResultBody.innerHTML = `<tr><td colspan="4" class="px-4 py-8 text-center text-blue-500 animate-pulse">${i18n[currentLang].searching}</td></tr>`;

  try {
    const data: any = await invoke('cf_api', {
      accountId: creds.accountId,
      token: creds.token,
      path: `vectorize/v2/indexes/${indexName}/get_by_ids`,
      method: 'POST',
      body: { ids }
    });

    if (data.success) {
      renderTable(data.result || []);
    } else {
      elResultBody.innerHTML = `<tr><td colspan="4" class="text-center text-red-500">${i18n[currentLang].failed}</td></tr>`;
      showModal(i18n[currentLang].failed, JSON.stringify(data.errors, null, 2));
    }
  } catch (err) {
    elResultBody.innerHTML = `<tr><td colspan="4" class="text-center text-red-500">${i18n[currentLang].error}</td></tr>`;
    showModal(i18n[currentLang].error, String(err));
  }
});

btnSearchByText.addEventListener('click', async () => {
  const creds = getCreds();
  const indexName = elIndexSelect.value;
  const searchText = elSearchText.value.trim();
  const model = elEmbeddingModel.value;
  if (!creds || !indexName || !searchText || currentDimension === 0) return;

  elResultBody.innerHTML = `<tr><td colspan="4" class="px-4 py-8 text-center text-blue-500 animate-pulse">${i18n[currentLang].generatingVector}</td></tr>`;

  try {
    const embedData: any = await invoke('cf_api', {
      accountId: creds.accountId,
      token: creds.token,
      path: `ai/run/${model}`,
      method: 'POST',
      body: {
        text: [searchText]
      }
    });

    if (!embedData.success) {
      elResultBody.innerHTML = `<tr><td colspan="4" class="text-center text-red-500">${i18n[currentLang].generatingVectorFailed}</td></tr>`;
      showModal(i18n[currentLang].generatingVectorFailed, JSON.stringify(embedData.errors, null, 2));
      return;
    }

    const vector = embedData.result.data[0];
    if (!vector || vector.length !== currentDimension) {
      elResultBody.innerHTML = `<tr><td colspan="4" class="text-center text-red-500">${i18n[currentLang].dimensionMismatch}</td></tr>`;
      return;
    }

    const queryData: any = await invoke('cf_api', {
      accountId: creds.accountId,
      token: creds.token,
      path: `vectorize/v2/indexes/${indexName}/query`,
      method: 'POST',
      body: { vector, topK: 10, returnValues: false, returnMetadata: 'all' }
    });

    if (queryData.success) {
      renderTable(queryData.result.matches || []);
    } else {
      elResultBody.innerHTML = `<tr><td colspan="4" class="text-center text-red-500">${i18n[currentLang].queryFailed}</td></tr>`;
      showModal(i18n[currentLang].queryFailed, JSON.stringify(queryData.errors, null, 2));
    }
  } catch (err) {
    elResultBody.innerHTML = `<tr><td colspan="4" class="text-center text-red-500">${i18n[currentLang].error}</td></tr>`;
    showModal(i18n[currentLang].error, String(err));
  }
});

function updateSelection() {
  const checkboxes = document.querySelectorAll('.row-checkbox') as NodeListOf<HTMLInputElement>;
  const checkedBoxes = Array.from(checkboxes).filter(cb => cb.checked);

  elSelectAll.checked = checkboxes.length > 0 && checkedBoxes.length === checkboxes.length;
  elSelectedCount.textContent = checkedBoxes.length.toString();
  btnDeleteSelected.disabled = checkedBoxes.length === 0;
}

elSelectAll.addEventListener('change', (e) => {
  const isChecked = (e.target as HTMLInputElement).checked;
  document.querySelectorAll('.row-checkbox').forEach(cb => {
    (cb as HTMLInputElement).checked = isChecked;
  });
  updateSelection();
});

btnDeleteSelected.addEventListener('click', async () => {
  const creds = getCreds();
  const indexName = elIndexSelect.value;
  if (!creds || !indexName) return;

  const checkedBoxes = document.querySelectorAll('.row-checkbox:checked') as NodeListOf<HTMLInputElement>;
  const idsToDelete = Array.from(checkedBoxes).map(cb => cb.value);

  const confirmed = await showModal(
    i18n[currentLang].confirmDeleteTitle,
    i18n[currentLang].confirmDelete.replace('{count}', idsToDelete.length.toString()),
    true
  );
  if (!confirmed) return;

  const originText = btnDeleteSelected.innerHTML;
  btnDeleteSelected.innerHTML = i18n[currentLang].deleting;
  btnDeleteSelected.disabled = true;

  try {
    const data: any = await invoke('cf_api', {
      accountId: creds.accountId,
      token: creds.token,
      path: `vectorize/v2/indexes/${indexName}/delete_by_ids`,
      method: 'POST',
      body: { ids: idsToDelete }
    });

    if (data.success) {
      const deletedCount = data.result?.count || idsToDelete.length;
      showModal(i18n[currentLang].notice, `${i18n[currentLang].deleteSuccess} ${deletedCount} ${i18n[currentLang].vectorCount.toLowerCase()}`);

      checkedBoxes.forEach(cb => {
        const tr = cb.closest('tr');
        if (tr) tr.remove();
      });
      updateSelection();

      await updateIndexInfo(indexName);

      setTimeout(() => updateIndexInfo(indexName), 600);
    } else {
      showModal(i18n[currentLang].deleteFailed, JSON.stringify(data.errors, null, 2));
    }
  } catch (err) {
    showModal(i18n[currentLang].requestError, String(err));
  } finally {
    btnDeleteSelected.innerHTML = originText;
    updateSelection();
  }
});