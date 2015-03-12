BUILD_DIR 	= public/js
BUNDLE 		= $(BUILD_DIR)/bundle.js
ENTRY		= src/js/index.js

SRC = $(ENTRY)
ifneq ($(wildcard src/js/lib),)
  SRC += $(shell find src/js/lib -type f -name '*.js')
endif

.PHONY: all clean info watch

all: $(BUNDLE)

clean:
	rm -f $(BUNDLE)

info:
	@echo "Source:" $(SRC)

watch:
	./node_modules/.bin/watchify -o $(BUNDLE) -s $(EXPORT) $(ENTRY) &

$(BUILD_DIR):
	mkdir -p $(BUILD_DIR)

$(BUNDLE): $(BUILD_DIR)
	./node_modules/.bin/browserify $(ENTRY) -o $@

