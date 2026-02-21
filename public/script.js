/**
 * Big Barber Admin - Modern Dashboard Logic
 * Focused on performance, reusability, and clean architecture.
 */

class BigBarberApp {
    constructor() {
        this.initDOMElements();
        this.initEventListeners();
        this.fetchSalons();
    }

    initDOMElements() {
        this.form = document.getElementById('salonForm');
        this.grid = document.getElementById('salonGrid');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.loader = document.getElementById('loader');
        this.toast = document.getElementById('toast');
        this.count = document.getElementById('salonCount');
        this.searchInput = document.getElementById('searchInput');
        this.imageInput = document.getElementById('images');
        this.imagePreview = document.getElementById('imagePreview');
        this.submitBtn = document.getElementById('submitBtn');
    }

    initEventListeners() {
        // Image Preview Handler
        this.imageInput.addEventListener('change', () => this.handleImagePreview());

        // Form Submission
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Search with Debounce
        this.searchTimeout = null;
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.fetchSalons(e.target.value);
            }, 500);
        });

        // Manual Refresh
        this.refreshBtn.addEventListener('click', () => {
            this.fetchSalons(this.searchInput.value);
        });
    }

    // --- Core Logic ---

    async fetchSalons(searchTerm = '') {
        this.toggleLoader(true);
        try {
            const url = searchTerm ? `/api/salons?search=${encodeURIComponent(searchTerm)}` : '/api/salons';
            const response = await fetch(url);
            const data = await response.json();

            this.renderSalons(data);
        } catch (error) {
            console.error('Fetch Error:', error);
            this.showToast('Failed to connect to Atlas', 'error');
        } finally {
            this.toggleLoader(false);
        }
    }

    async handleFormSubmit(e) {
        e.preventDefault();

        const formData = new FormData();
        const fields = ['name', 'city', 'rating', 'latitude', 'longitude'];

        fields.forEach(field => {
            formData.append(field, document.getElementById(field).value);
        });

        const featuresJson = document.getElementById('featuresJson').value;
        formData.append('features', featuresJson);

        const files = this.imageInput.files;
        for (let i = 0; i < files.length; i++) {
            formData.append('images', files[i]);
        }

        this.setSubmitLoading(true);

        try {
            const response = await fetch('/api/salons', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                this.showToast('Salon saved to Atlas!', 'success');
                this.form.reset();
                this.imagePreview.innerHTML = '';
                this.fetchSalons();
            } else {
                this.showToast(result.message || 'Error saving salon', 'error');
            }
        } catch (error) {
            this.showToast('Network error occurred', 'error');
        } finally {
            this.setSubmitLoading(false);
        }
    }

    handleImagePreview() {
        this.imagePreview.innerHTML = '';
        const files = Array.from(this.imageInput.files);

        if (files.length > 5) {
            this.showToast('Limit exceeded: Max 5 images', 'error');
            this.imageInput.value = '';
            return;
        }

        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const div = document.createElement('div');
                div.className = 'preview-item fade-in';
                div.innerHTML = `<img src="${e.target.result}" alt="preview">`;
                this.imagePreview.appendChild(div);
            };
            reader.readAsDataURL(file);
        });
    }

    // --- Rendering ---

    renderSalons(salons) {
        this.grid.innerHTML = '';
        this.count.textContent = `${salons.length} Salons Found`;

        if (salons.length === 0) {
            this.grid.innerHTML = '<div class="empty-state">No matching salons found in Atlas.</div>';
            return;
        }

        salons.forEach(salon => {
            const card = this.createSalonCard(salon);
            this.grid.insertAdjacentHTML('beforeend', card);
        });
    }

    createSalonCard(salon) {
        const date = new Date(salon.createdAt).toLocaleDateString();
        const mainImage = (salon.images && salon.images.length > 0)
            ? salon.images[0]
            : (salon.url || 'https://placehold.co/600x400?text=No+Image');

        return `
            <div class="salon-card glass-card fade-in">
                <div class="card-image">
                    <img src="${mainImage}" alt="${salon.name}" loading="lazy" onerror="this.src='https://placehold.co/600x400?text=Error+Loading'">
                    <div class="card-badges">
                        <span class="rating-badge"><i class="fas fa-star"></i> ${salon.rating || 'N/A'}</span>
                        ${salon.images?.length > 1 ? `<span class="image-count-badge"><i class="fas fa-images"></i> ${salon.images.length}</span>` : ''}
                        <span class="coords-badge"><i class="fas fa-compass"></i> ${salon.latitude?.toFixed(1)}, ${salon.longitude?.toFixed(1)}</span>
                        <span class="location-badge"><i class="fas fa-map-marker-alt"></i> ${salon.city}</span>
                    </div>
                </div>
                <div class="card-content">
                    <h3>${salon.name}</h3>
                    <div class="services-highlights">${this.renderHighlights(salon.features)}</div>
                    <div class="card-footer">
                        <span class="date"><i class="far fa-calendar-alt"></i> ${date}</span>
                        <button class="view-btn">Details <i class="fas fa-arrow-right"></i></button>
                    </div>
                </div>
            </div>
        `;
    }

    renderHighlights(features) {
        if (!features) return '<span class="service-tag">Standard Services</span>';
        const tags = [];
        const config = [
            { key: 'haircut', icon: 'scissors', label: 'Haircut' },
            { key: 'spa', icon: 'spa', label: 'Spa' },
            { key: 'makeup', icon: 'wand-magic-sparkles', label: 'Makeup' },
            { key: 'facial', icon: 'face-smile', label: 'Facial' }
        ];

        config.forEach(item => {
            if (features[item.key]?.length) {
                tags.push(`<span class="service-tag"><i class="fas fa-${item.icon}"></i> ${item.label}</span>`);
            }
        });

        return tags.length > 0 ? tags.join('') : '<span class="service-tag">Premium Care</span>';
    }

    // --- UI Helpers ---

    toggleLoader(show) {
        if (show) {
            this.loader.classList.remove('hidden');
            this.grid.style.opacity = '0.4';
        } else {
            this.loader.classList.add('hidden');
            this.grid.style.opacity = '1';
        }
    }

    setSubmitLoading(isLoading) {
        this.submitBtn.disabled = isLoading;
        this.submitBtn.innerHTML = isLoading
            ? '<span>Syncing with Atlas...</span><i class="fas fa-spinner fa-spin"></i>'
            : '<span>Save Salon Details</span><i class="fas fa-arrow-right"></i>';
    }

    showToast(message, type) {
        this.toast.textContent = message;
        this.toast.className = `toast ${type}`;
        this.toast.classList.remove('hidden');
        setTimeout(() => this.toast.classList.add('hidden'), 3500);
    }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => new BigBarberApp());
