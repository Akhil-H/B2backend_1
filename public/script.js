document.addEventListener('DOMContentLoaded', () => {
    const salonForm = document.getElementById('salonForm');
    const salonGrid = document.getElementById('salonGrid');
    const loadBtn = document.getElementById('refreshBtn');
    const loader = document.getElementById('loader');
    const toast = document.getElementById('toast');
    const salonCount = document.getElementById('salonCount');

    // Fetch and display salons
    const fetchSalons = async () => {
        showLoader(true);
        try {
            const response = await fetch('/api/salons');
            const data = await response.json();

            salonGrid.innerHTML = '';
            salonCount.textContent = `${data.length} Salons Found`;

            if (data.length === 0) {
                salonGrid.innerHTML = '<div class="empty-state">No salons registered yet. Start by adding one above!</div>';
            } else {
                data.forEach(salon => {
                    const date = new Date(salon.createdAt).toLocaleDateString();
                    const mainImage = salon.images && salon.images.length > 0 ? salon.images[0] : 'https://placehold.co/600x400?text=No+Image';

                    const card = `
                        <div class="salon-card glass-card">
                            <div class="card-image">
                                <img src="${mainImage}" alt="${salon.name}" onerror="this.src='https://placehold.co/600x400?text=Image+Load+Error'">
                                <div class="card-badges">
                                    <span class="rating-badge"><i class="fas fa-star"></i> ${salon.rating || 'N/A'}</span>
                                    <span class="location-badge"><i class="fas fa-map-marker-alt"></i> ${salon.city}</span>
                                </div>
                            </div>
                            <div class="card-content">
                                <h3>${salon.name}</h3>
                                <div class="services-highlights">
                                    ${renderHighlights(salon.features)}
                                </div>
                                <div class="card-footer">
                                    <span class="date"><i class="far fa-calendar-alt"></i> ${date}</span>
                                    <button class="view-btn">Details <i class="fas fa-chevron-right"></i></button>
                                </div>
                            </div>
                        </div>
                    `;
                    salonGrid.insertAdjacentHTML('beforeend', card);
                });
            }
        } catch (error) {
            console.error('Error fetching salons:', error);
            showToast('Failed to load salons', 'error');
        } finally {
            showLoader(false);
        }
    };

    const renderHighlights = (features) => {
        if (!features) return '<span class="no-services">No services listed</span>';
        const highlights = [];
        if (features.haircut?.length) highlights.push(`<span class="service-tag"><i class="fas fa-scissors"></i> Haircut</span>`);
        if (features.spa?.length) highlights.push(`<span class="service-tag"><i class="fas fa-spa"></i> Spa</span>`);
        if (features.makeup?.length) highlights.push(`<span class="service-tag"><i class="fas fa-wand-magic-sparkles"></i> Makeup</span>`);
        if (features.facial?.length) highlights.push(`<span class="service-tag"><i class="fas fa-face-smile"></i> Facial</span>`);

        return highlights.length > 0 ? highlights.join('') : '<span class="no-services">Standard Services</span>';
    };

    // Handle form submission
    salonForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = document.getElementById('submitBtn');
        const formData = new FormData();

        // Basic Info
        formData.append('name', document.getElementById('name').value);
        formData.append('city', document.getElementById('city').value);
        formData.append('rating', document.getElementById('rating').value);
        formData.append('latitude', document.getElementById('latitude').value);
        formData.append('longitude', document.getElementById('longitude').value);

        // Features JSON
        const featuresJson = document.getElementById('featuresJson').value;
        formData.append('features', featuresJson);

        // Multiple Images
        const imageFiles = document.getElementById('images').files;
        for (let i = 0; i < imageFiles.length; i++) {
            formData.append('images', imageFiles[i]);
        }

        // UI Feedback
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Processing...</span><i class="fas fa-spinner fa-spin"></i>';

        try {
            const response = await fetch('/api/salons', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                showToast('Salon registered successfully!', 'success');
                salonForm.reset();
                fetchSalons();
            } else {
                showToast(result.message || 'Error saving salon', 'error');
            }
        } catch (error) {
            console.error('Error adding salon:', error);
            showToast('Connection failed', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Save Salon Details</span><i class="fas fa-arrow-right"></i>';
        }
    });

    // Refresh button
    loadBtn.addEventListener('click', fetchSalons);

    // Utils
    function showLoader(show) {
        if (show) {
            loader.classList.remove('hidden');
            salonGrid.style.opacity = '0.3';
        } else {
            loader.classList.add('hidden');
            salonGrid.style.opacity = '1';
        }
    }

    function showToast(message, type) {
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.remove('hidden');

        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }

    // Initial load
    fetchSalons();
});

