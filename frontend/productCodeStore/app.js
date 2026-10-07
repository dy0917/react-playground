      const starterProducts = [
        { name: "Everyday Canvas Tote", code: "BAG-104", category: "Accessories" },
        { name: "Insulated Travel Mug", code: "HOME-218", category: "Home & Living" },
        { name: "Field Notes Journal", code: "PPR-036", category: "Stationery" },
        { name: "Wool Blend Cap", code: "APP-071", category: "Apparel" },
      ];
      const storageKey = "product-code-store-products";
      let products;
      try {
        products = JSON.parse(localStorage.getItem(storageKey)) || starterProducts;
      } catch {
        products = starterProducts;
      }

      const productList = document.querySelector("#product-list");
      const search = document.querySelector("#search");
      const categoryFilter = document.querySelector("#category-filter");
      const resultCount = document.querySelector("#result-count");
      const emptyState = document.querySelector("#empty-state");
      const productDialog = document.querySelector("#product-dialog");
      const productForm = document.querySelector("#product-form");

      function saveProducts() {
        localStorage.setItem(storageKey, JSON.stringify(products));
      }

      function renderProducts() {
        const query = search.value.trim().toLowerCase();
        const selectedCategory = categoryFilter.value;
        const categories = [...new Set(products.map((product) => product.category))].sort();
        categoryFilter.innerHTML = '<option value="">All categories</option>';
        categories.forEach((category) => {
          const option = document.createElement("option");
          option.value = category;
          option.textContent = category;
          categoryFilter.append(option);
        });
        categoryFilter.value = categories.includes(selectedCategory) ? selectedCategory : "";

        const visibleProducts = products.filter((product) => {
          const matchesQuery = `${product.name} ${product.code}`.toLowerCase().includes(query);
          return matchesQuery && (!categoryFilter.value || product.category === categoryFilter.value);
        });
        productList.replaceChildren();
        visibleProducts.forEach((product) => {
          const row = document.createElement("tr");
          [product.name, product.code, product.category, "Active"].forEach((value, index) => {
            const cell = document.createElement("td");
            cell.textContent = value;
            if (index === 0) cell.className = "product-name";
            if (index === 1) cell.className = "code";
            if (index === 2) cell.className = "category";
            if (index === 3) {
              cell.innerHTML = '<span class="status">Active</span>';
            }
            row.append(cell);
          });
          productList.append(row);
        });
        resultCount.textContent = `${visibleProducts.length} ${visibleProducts.length === 1 ? "product" : "products"}`;
        emptyState.hidden = visibleProducts.length > 0;
      }

      document.querySelector("#open-dialog").addEventListener("click", () => productDialog.showModal());
      document.querySelector("#close-dialog").addEventListener("click", () => productDialog.close());
      document.querySelector("#cancel-dialog").addEventListener("click", () => productDialog.close());
      search.addEventListener("input", renderProducts);
      categoryFilter.addEventListener("change", renderProducts);
      document.querySelector("#product-code").addEventListener("input", (event) => event.currentTarget.setCustomValidity(""));
      productForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(productForm);
        const code = formData.get("code").trim().toUpperCase();
        if (products.some((product) => product.code.toLowerCase() === code.toLowerCase())) {
          document.querySelector("#product-code").setCustomValidity("That product code is already in use.");
          document.querySelector("#product-code").reportValidity();
          return;
        }
        document.querySelector("#product-code").setCustomValidity("");
        products.unshift({
          name: formData.get("name").trim(),
          code,
          category: formData.get("category").trim(),
        });
        saveProducts();
        productForm.reset();
        productDialog.close();
        renderProducts();
      });

      renderProducts();
